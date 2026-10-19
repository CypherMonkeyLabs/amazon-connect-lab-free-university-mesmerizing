/* Local retrieval for a lab chat bot. No network, no model.
   Tokenise, stem, synonyms, BM25, typo fix, and index seeds.
   Answers are excerpts the caller stored in the index. This file does not invent text.
   Weak scores fall back. Injection is refused before any search. */

const STOP = new Set(`a an the and or to of for in on with is are was be do does did how what why when where who you i me my it this that from as at by not can your about into than then just like using use used please tell want need something thing things really very know code python lab learn learning work works write writing make makes lesson page explain mean means show ask asking have has could would should will its if times`.split(" "));

const KIND_WEIGHT = {
  lesson: 1.22,
  guide: 1.08,
  glossary: 1.14,
  slide: 1.04,
  section: 1.0,
  quiz: 0.8,
  hint: 0.72,
  download: 0.92,
  game: 0.9,
  media: 0.96,
  page: 0.94,
  level: 0.9,
  diagram: 0.98,
};

const MIN_SCORE = 2.4;
const MIN_MARGIN = 1.2;
const FILLER = new Set("one ones onto some here there also still only own per via etc yes no ok okay please just really very two three four five six seven eight nine ten over under between across around after before without within during versus vs along among happen happens happened instead good useful".split(" "));
const STOP_WORDS = [...STOP];

export function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/f-strings?/g, " fstring ")
    .replace(/t-strings?/g, " tstring ")
    .replace(/==/g, " equals ")
    .replace(/!=/g, " unequals ")
    .replace(/<=/g, " lesseq ")
    .replace(/>=/g, " greatereq ")
    .replace(/\/\//g, " floordiv ")
    .replace(/\*\*/g, " powerop ")
    .replace(/%/g, " modulo ")
    .replace(/=/g, " assign ")
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(word) {
  if (word.length < 4) return word;
  if (word.length === 4) {
    if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
  }
  if (word.endsWith("ies") && word.length > 5 && word !== "series") return `${word.slice(0, -3)}y`;
  if (word.endsWith("ing") && word.length > 6) {
    let base = word.slice(0, -3);
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1);
    return base;
  }
  if (word.endsWith("ed") && word.length > 5) return word.slice(0, -2);
  if (/(ches|shes|sses|xes|zes|oes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us") && !word.endsWith("is")) return word.slice(0, -1);
  return word;
}

function canon(word, syn) {
  if (!word) return "";
  if (syn[word]) return syn[word];
  const stemmed = stem(word);
  if (syn[stemmed]) return syn[stemmed];
  return stemmed;
}

export function tokens(text, syn = {}, cap = 3) {
  const counts = new Map();
  const out = [];
  const parts = normalize(text).split(" ");
  for (const raw of parts) {
    if (!raw || STOP.has(raw)) continue;
    const term = canon(raw, syn);
    if (!term || term.length < 2 || STOP.has(term)) continue;
    const seen = counts.get(term) || 0;
    if (seen >= cap) continue;
    counts.set(term, seen + 1);
    out.push(term);
  }
  return out;
}

function distance(a, b, max) {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > max) return max + 1;
  const row = new Array(bl + 1);
  for (let j = 0; j <= bl; j += 1) row[j] = j;
  for (let i = 1; i <= al; i += 1) {
    let prev = row[0];
    row[0] = i;
    let best = row[0];
    for (let j = 1; j <= bl; j += 1) {
      const cur = row[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
      row[j] = next;
      if (next < best) best = next;
    }
    if (best > max) return max + 1;
  }
  return row[bl];
}

function damerau(a, b, max) {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > max) return max + 1;
  const rows = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i += 1) rows[i][0] = i;
  for (let j = 0; j <= bl; j += 1) rows[0][j] = j;
  for (let i = 1; i <= al; i += 1) {
    let best = rows[i][0];
    for (let j = 1; j <= bl; j += 1) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let next = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
        next = Math.min(next, rows[i - 2][j - 2] + 1);
      }
      rows[i][j] = next;
      if (next < best) best = next;
    }
    if (best > max) return max + 1;
  }
  return rows[al][bl];
}

function sharedPrefix(left, right) {
  let i = 0;
  const limit = Math.min(left.length, right.length);
  while (i < limit && left.charCodeAt(i) === right.charCodeAt(i)) i += 1;
  return i;
}

function sameFuzzyRank(word, left, leftD, right, rightD) {
  if (leftD !== rightD) return false;
  if (word.startsWith(left) !== word.startsWith(right)) return false;
  if (sharedPrefix(word, left) !== sharedPrefix(word, right)) return false;
  return Math.abs(left.length - word.length) === Math.abs(right.length - word.length);
}

function betterFuzzy(word, cand, dist, best, bestD) {
  if (!best || dist < bestD) return true;
  if (dist > bestD) return false;
  const candHead = word.startsWith(cand);
  const bestHead = word.startsWith(best);
  if (candHead !== bestHead) return candHead;
  const gain = sharedPrefix(word, cand) - sharedPrefix(word, best);
  if (gain !== 0) return gain > 0;
  return Math.abs(cand.length - word.length) < Math.abs(best.length - word.length);
}

function fuzzy(word, pool, forcedMax, freq) {
  if (!word || word.length < 2) return "";
  if (!forcedMax && word.length < 4) return "";
  const max = forcedMax || (word.length >= 7 ? 2 : 1);
  let best = "";
  let bestD = max + 1;
  const winners = [];
  const first = word[0];
  for (const cand of pool) {
    if (!cand || cand[0] !== first) continue;
    if (Math.abs(cand.length - word.length) > max) continue;
    const dist = damerau(word, cand, max);
    if (dist > max || dist === 0) continue;
    if (word.length >= 6 && sharedPrefix(word, cand) < 2) continue;
    if (betterFuzzy(word, cand, dist, best, bestD)) {
      bestD = dist;
      best = cand;
      winners.length = 0;
      winners.push(cand);
    } else if (sameFuzzyRank(word, cand, dist, best, bestD)) {
      winners.push(cand);
    }
  }
  if (winners.length === 1) return winners[0];
  if (winners.length < 2) return "";
  let shared = winners[0];
  for (const cand of winners.slice(1)) {
    const n = sharedPrefix(shared, cand);
    shared = shared.slice(0, n);
  }
  const poolSet = new Set(pool);
  for (let n = shared.length; n >= 4; n -= 1) {
    const head = shared.slice(0, n);
    if (poolSet.has(head)) return head;
  }
  const prefixed = winners.filter((cand) => cand.startsWith(word) || word.startsWith(cand));
  const weight = (cand) => (freq && freq.get(cand)) || 0;
  const ranked = (prefixed.length ? prefixed : winners).slice().sort((a, b) => (
    a.length - b.length || weight(b) - weight(a) || a.localeCompare(b)
  ));
  return ranked[0] || "";
}

function collapseToKnown(word, isKnown) {
  if (!/(.)\1/.test(word)) return "";
  const seen = new Set([word]);
  let layer = [word];
  for (let pass = 0; pass < 2; pass += 1) {
    const next = [];
    for (const item of layer) {
      for (let i = 0; i < item.length - 1; i += 1) {
        if (item[i] !== item[i + 1]) continue;
        const cand = item.slice(0, i) + item.slice(i + 1);
        if (seen.has(cand)) continue;
        seen.add(cand);
        if (isKnown(cand)) return cand;
        next.push(cand);
      }
    }
    layer = next;
  }
  return "";
}

function queryTokens(text, syn, pool, knownSet, seedPool, freq) {
  const out = [];
  const isKnown = (word) => Boolean(word) && (knownSet.has(word) || knownSet.has(stem(word)) || Boolean(syn[word]) || Boolean(syn[stem(word)]));
    const parts = normalize(text).split(" ").filter((raw) => raw && !STOP.has(raw));
  const unknown = parts.filter((raw) => !isKnown(raw) && !collapseToKnown(raw, isKnown));
  const allowFuzzy = unknown.length < 3;
  for (const raw of parts) {
    let word = raw;
    if (!isKnown(word)) {
      const collapsed = collapseToKnown(word, isKnown);
      if (collapsed) word = collapsed;
      else if (allowFuzzy) {
        const fix = fuzzy(word, pool, 0, freq);
        if (fix) word = fix;
        else if (seedPool && word.length <= 3) {
          const small = fuzzy(word, seedPool, 1, freq);
          if (small) word = small;
        }
      }
    }
    const term = canon(word, syn);
    if (!term || term.length < 2 || STOP.has(term)) continue;
    out.push(term);
  }
  return out;
}

function count(list) {
  const tf = new Map();
  for (const term of list) tf.set(term, (tf.get(term) || 0) + 1);
  return tf;
}

function bm25(terms, tf, dl, avgdl, nDocs, df) {
  const k1 = 1.2;
  const b = 0.75;
  let score = 0;
  const seen = new Set();
  for (const term of terms) {
    if (seen.has(term)) continue;
    seen.add(term);
    const freq = tf.get(term) || 0;
    if (!freq) continue;
    const n = df.get(term) || 0;
    const idf = Math.log(1 + (nDocs - n + 0.5) / (n + 0.5));
    const norm = freq * (k1 + 1) / (freq + k1 * (1 - b + b * (dl / avgdl)));
    score += idf * norm;
  }
  return score;
}

function frameOf(text) {
  const q = normalize(text);
  if (/^how (do|does|to|can)\b/.test(q)) return "how do";
  if (/^show\b/.test(q)) return "show";
  return "what is";
}

function injection(raw) {
  const original = String(raw || "").toLowerCase();
  const q = normalize(original);
  if (/\bsystem\s*:/.test(original)) return true;
  if (/\bdan\b/.test(q)) return true;
  const patterns = [
    /\bignore\b(?:\s+\w+){0,8}\s+(?:rules|instructions|prompts?|everything|all|what|previous|above|told)\b/,
    /\bdisregard\b(?:\s+\w+){0,8}\s+(?:rules|instructions|prompts?|guidelines|everything)\b/,
    /\byou are now\b/,
    /\bsystem prompt\b/,
    /\bsystem message\b/,
    /\bjailbreak\b/,
    /\bdo anything now\b/,
    /\bdeveloper mode\b/,
    /\breveal your\b/,
    /\b(repeat|print|reveal|output|dump|show)\b(?:\s+\w+){0,8}\s+(?:the\s+|your\s+)?(?:hidden\s+)?(?:text|words|prompt|instructions|message|guidelines)\b/,
    /\b(?:text|words|prompt|instructions|message)\b(?:\s+\w+){0,4}\s+above\b/,
    /\bstarting with\b[\s\S]{0,40}\byou are\b/,
    /\broleplay\b/,
    /\bpretend\b/,
    /\bact as \b/,
    /\bact like\b/,
    /\bno restrictions\b/,
    /\bforget\b(?:\s+\w+){0,6}\s+(?:rules|instructions|lab|you are)\b/,
    /\bnew instructions\b/,
    /\bfrom now on you are\b/,
    /\bunrestricted assistant\b/,
    /\bhidden instructions\b/,
    /\byour prompt\b/,
  ];
  return patterns.some((pattern) => pattern.test(q) || pattern.test(original));
}

const AMBIGUOUS = new Set("set list time key name file type open read match pass break call run end add new get use make home world page level course value data text line number item code help start show play count group say says said want need look come take give know think tell tell".split(" "));
const STRONG_WORDS = new Set("connect amazon queue queues routing profile profiles lex lambda kinesis ccp lens flow flows ivr sip pstn ctr saml kms iam dtmf callback telephony webrtc turn chat sms whatsapp email campaign salesforce servicenow genesys avaya cucm uccx ucce webex twilio cpaas e911 resiliency quota quotas agent agents workspace streams vdi cases tasks outbound inbound porting did tollfree cloudwatch region regions module modules block blocks attribute attributes intent intents slot slots fallback prompt prompts redaction transcript evaluation adherence forecast erlang wfm recording voiceid wisdom whisper quickconnect proficiency skill skills contacttrace softphone hours".split(" "));
const GENERIC_ENGLISH = new Set("time life home world page course help start people person spanish tokyo poem sea thank thanks meaning telephone calorie calories banana capital hiking restaurant population colour color breakfast winter rainfall lullaby haiku mango egg moon landing movie pizza weather flight story dragon cricket tire cake president bitcoin joke french goodbye sourdough photosynthesis pytorch kubernetes chime pinpoint wickr five9 cxone talkdesk honeycode appsync monitron sagemaker bread leaf cricket cup gpu ingress meeting journey graphql training".split(" "));

function buildDomain(df, seeds) {
  const strong = new Set(STRONG_WORDS);
  const consider = (term, min) => {
    if (!term || term.length < min) return;
    if (STOP.has(term) || FILLER.has(term) || GENERIC_ENGLISH.has(term) || AMBIGUOUS.has(term)) return;
    strong.add(term);
  };
  for (const term of df.keys()) consider(term, 3);
  for (const seed of seeds || []) {
    for (const term of [...(seed.any || []), ...(seed.all || [])]) consider(term, 4);
  }
  return { strong, weak: AMBIGUOUS };
}

function domainKind(word, domain, syn) {
  const forms = [word, stem(word)];
  const canonical = canon(word, syn);
  if (canonical) forms.push(canonical);
  if (forms.some((form) => domain.strong.has(form))) return "strong";
  if (forms.some((form) => domain.weak.has(form))) return "weak";
  const collapsed = collapseToKnown(word, (candidate) => {
    const stemmed = stem(candidate);
    return domain.strong.has(candidate) || domain.strong.has(stemmed) || domain.weak.has(candidate) || domain.weak.has(stemmed);
  });
  if (!collapsed) return "";
  if (domain.strong.has(collapsed) || domain.strong.has(stem(collapsed))) return "strong";
  return "weak";
}

function typoKind(word, domain, syn, pool, freq) {
  if (!word || word.length < 4 || GENERIC_ENGLISH.has(word)) return "";
  const fix = fuzzy(word, pool, word.length >= 7 ? 2 : 1, freq);
  if (!fix) return "";
  if (STOP.has(fix) || STOP.has(stem(fix))) return "stop";
  const kind = domainKind(fix, domain, syn);
  if (!kind) return "";
  if (kind === "weak" && sharedPrefix(word, fix) < 2) return "";
  if (word.length >= 6 && sharedPrefix(word, fix) < 2) return "";
  return kind;
}

const BRAND_ONLY = new Set("amazon aws".split(" "));
const CONNECT_SPECIFIC = new Set("connect queue route profile lex lambda kinesis ccp lens flow ivr sip pstn ctr saml kms iam dtmf callback telephony webrtc campaign softphone hours quickconnect proficiency whisper voiceid wisdom recording redaction transcript forecast erlang wfm quota resiliency cloudwatch attribute module block prompt slot intent evaluation adherence workspace stream vdi case task outbound inbound porting did tollfree e911 whatsapp sms contacttrace".split(" "));
const CONNECT_LIST = [...CONNECT_SPECIFIC];
/* Consumer Amazon, neighbour products, and words that also appear in ordinary English.
   Any one of these closes search, even if a lesson happens to contain the word. */
const HARD_OFF = new Set("prime password kindle alexa audible imdb twitch zoom word excel powerpoint outlook teams microsoft windows office google slack java python javascript pizza france netflix facebook instagram tiktok five9 cxone talkdesk nice chime pinpoint wickr honeycode appsync monitron sagemaker kubernetes pytorch sourdough photosynthesis cricket crash background bread leaf cucumber graphql ingress".split(" "));
const SOFT_NEIGHBOUR = new Set("genesys avaya webex twilio salesforce servicenow cucm uccx ucce cpaas".split(" "));
const INTENT_RE = /\b(what|whats|how|why|where|when|which|who|does|do|did|can|could|is|are|explain|define|mean|means|difference|versus|about)\b/;

function specificTerm(word, syn, freq) {
  const forms = [word, stem(word), canon(word, syn)];
  for (const form of forms) {
    if (CONNECT_SPECIFIC.has(form)) return form;
  }
  if (word.length < 5 || HARD_OFF.has(word) || GENERIC_ENGLISH.has(word)) return "";
  const fix = fuzzy(word, CONNECT_LIST, word.length >= 8 ? 2 : 1, freq);
  if (!fix || !CONNECT_SPECIFIC.has(fix) || sharedPrefix(word, fix) < 2) return "";
  return fix;
}

function hasDomainTerm(text, domain, syn, pool, freq) {
  void domain;
  void pool;
  const q = normalize(text);
  const parts = q.split(" ").filter((word) => word && word.length >= 2 && !STOP.has(word) && !FILLER.has(word));
  if (!parts.length) return false;
  const marked = (word, list) => list.has(word) || list.has(stem(word)) || list.has(canon(word, syn));
  if (parts.some((word) => marked(word, HARD_OFF))) return false;
  const specifics = [];
  let foreign = 0;
  for (const word of parts) {
    if (BRAND_ONLY.has(word)) continue;
    const hit = specificTerm(word, syn, freq);
    if (hit) specifics.push(hit);
    else foreign += 1;
  }
  if (!specifics.length) return false;
  if (parts.some((word) => marked(word, SOFT_NEIGHBOUR)) && specifics.every((term) => SOFT_NEIGHBOUR.has(term))) return false;
  if (INTENT_RE.test(q)) return true;
  return foreign === 0;
}

const GREET_FILL = new Set("there friend monkey everyone folks all buddy pal anyone home up whats ya bot again today please just so hi hello".split(" "));

function smallTalk(q) {
  const words = q.split(" ").filter(Boolean);
  if (!words.length || words.length > 8) return null;
  const tailOk = (rest) => rest.every((word) => GREET_FILL.has(word));
  let kind = "";
  if (words[0] === "good" && /^(morning|afternoon|evening|night|day)$/.test(words[1] || "") && tailOk(words.slice(2))) kind = "greet";
  else if (/^(hi|hello|hey|hiya|howdy|yo|morning|evening)$/.test(words[0]) && tailOk(words.slice(1))) kind = "greet";
  else if (/^(thanks|thank|thx|ty|cheers)$/.test(words[0]) && words.slice(1).every((word) => /^(you|a|lot|bunch|ton|million|so|much|py)$/.test(word))) kind = "thanks";
  else if (/^(good job|nice work|well done)$/.test(q)) kind = "thanks";
  else if (/^(bye|goodbye|cya|later)$/.test(words[0]) && tailOk(words.slice(1))) kind = "bye";
  else if (q === "see you" || q === "see you later" || q === "see ya") kind = "bye";
  else if (/^(who are you|what are you|whats your name|what is your name)$/.test(q)) kind = "who";
  else if (/^are you\b/.test(q) && /\b(robot|person|human|bot|ai|real)\b/.test(q) && words.length <= 8) kind = "who";
  else if (/^how are you\b/.test(q) && tailOk(words.slice(3))) kind = "how";
  if (!kind) return null;
  let text = "Hello. I look up pages in this lab. Ask where to start, or about queues, contact flows, or the CCP.";
  let mode = "greet";
  let intent = "greet";
  if (kind === "who") {
    mode = "smalltalk";
    intent = "smalltalk";
    text = "I am the guide monkey in Cypher Monkey's Amazon Connect Lab. Cypher Monkey is a lifelong student and AI builder. I answer only from this lab's lessons, and I can be wrong.";
  } else if (kind === "bye") {
    mode = "smalltalk";
    intent = "smalltalk";
    text = "See you in the lab. The lessons stay on this device.";
  } else if (kind === "thanks") {
    mode = "smalltalk";
    intent = "smalltalk";
    text = "You're welcome. Open a lesson when you want to try it.";
  } else if (kind === "how") {
    mode = "smalltalk";
    intent = "smalltalk";
    text = "Ready when you are. Ask about a contact-center topic from this lab.";
  }
  return emptyAnswer({
    mode,
    intent,
    text,
    follow: "Where do I start?",
    followQ: "Where do I start?",
  });
}

function clip(text, max = 280) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  if (stop > 80) return cut.slice(0, stop + 1);
  return `${cut.slice(0, max - 1).trim()}…`;
}

function emptyAnswer(partial) {
  return {
    mode: "fallback",
    intent: "",
    text: "",
    href: "",
    link: "",
    example: "",
    follow: "",
    followQ: "",
    act: "",
    hits: [],
    closest: [],
    ...partial,
  };
}

export function createRetriever(index) {
  const syn = index && index.syn ? index.syn : {};
  const docs = (index && index.docs ? index.docs : []).map((doc) => {
    const body = Array.isArray(doc.w) ? doc.w : [];
    const title = Array.isArray(doc.tw) ? doc.tw : [];
    return {
      ...doc,
      body,
      title,
      tf: count(body),
      ttf: count(title),
      dl: body.length || 1,
      tdl: title.length || 1,
      titleNorm: normalize(doc.ti),
    };
  });
  const df = new Map();
  const tdf = new Map();
  const pool = [];
  const seenPool = new Set();
  const addPool = (term) => {
    if (!term || term.length < 4 || seenPool.has(term)) return;
    seenPool.add(term);
    pool.push(term);
  };
  docs.forEach((doc) => {
    new Set(doc.body).forEach((term) => {
      df.set(term, (df.get(term) || 0) + 1);
      addPool(term);
    });
    new Set(doc.title).forEach((term) => {
      tdf.set(term, (tdf.get(term) || 0) + 1);
      addPool(term);
    });
  });
  Object.keys(syn).forEach(addPool);
  const knownSet = new Set(pool);
  df.forEach((_, term) => knownSet.add(term));
  tdf.forEach((_, term) => knownSet.add(term));
  Object.entries(syn).forEach(([key, value]) => {
    knownSet.add(key);
    knownSet.add(value);
  });
  const freq = new Map(df);
  tdf.forEach((count, term) => freq.set(term, (freq.get(term) || 0) + count));
  const domain = buildDomain(df, index && index.seeds);
  const seeds = Array.isArray(index && index.seeds) ? index.seeds : [];
  const seedPool = [];
  const seedSeen = new Set();
  const addSeed = (term) => {
    if (!term || term.length < 2 || seedSeen.has(term)) return;
    seedSeen.add(term);
    seedPool.push(term);
    knownSet.add(term);
    addPool(term);
    if (term.length < 4) return;
    [`${term}s`, `${term}ing`, `${term}ed`, term.endsWith("e") ? `${term.slice(0, -1)}ing` : ""].forEach((variant) => {
      if (!variant || seedSeen.has(variant)) return;
      seedSeen.add(variant);
      seedPool.push(variant);
      addPool(variant);
    });
  };
  seeds.forEach((seed) => {
    (seed.all || []).forEach(addSeed);
    (seed.any || []).forEach(addSeed);
    (seed.allow || []).forEach(addSeed);
    (seed.block || []).forEach(addSeed);
  });
  const nDocs = docs.length || 1;
  const avgdl = docs.reduce((sum, doc) => sum + doc.dl, 0) / nDocs || 1;
  const avgtdl = docs.reduce((sum, doc) => sum + doc.tdl, 0) / nDocs || 1;
  let memory = null;

  function search(text, limit = 3) {
    const qTerms = queryTokens(text, syn, pool, knownSet, seedPool, freq);
    const qset = new Set(qTerms);
    const nq = normalize(text);
    const ranked = [];
    for (const doc of docs) {
      if (!qTerms.length) break;
      let score = bm25(qTerms, doc.tf, doc.dl, avgdl, nDocs, df);
      score += 2.1 * bm25(qTerms, doc.ttf, doc.tdl, avgtdl, nDocs, tdf);
      const titleHits = new Set(doc.title.filter((term) => qset.has(term)));
      const uniqueQ = [...qset];
      const matched = uniqueQ.filter((term) => doc.tf.has(term) || doc.ttf.has(term));
      score += titleHits.size * 6;
      if (doc.titleNorm.length >= 6 && ` ${nq} `.includes(` ${doc.titleNorm} `)) score += 16;
      else if (doc.title.length === 1 && qset.has(doc.title[0]) && doc.title[0].length >= 3) score += 9;
      else if (doc.title.length >= 2 && doc.title.every((term) => qset.has(term))) score += 9;
      if (uniqueQ.length >= 2 && matched.length === uniqueQ.length) score += 5;
      if (uniqueQ.length >= 2 && matched.length < uniqueQ.length) score *= 0.42;
      if (uniqueQ.length >= 3 && matched.length * 2 < uniqueQ.length) score *= 0.3;
      const askingHint = /^(a )?hints?\b|\b(show|give)( me)? (a )?hints?\b/.test(nq);
      if (doc.k === "hint" && !askingHint) score *= 0.15;
      const defines = /^(what is|what are|what does|how do|how does|explain|define|meaning of)\b/.test(nq);
      const titled = doc.titleNorm.length >= 6 && ` ${nq} `.includes(` ${doc.titleNorm} `);
      if ((doc.k === "glossary" || doc.k === "quiz" || doc.k === "hint") && titleHits.size === 0) score *= 0.5;
      if (defines && doc.k === "glossary" && titleHits.size) score += 3.2;
      if (defines && doc.k === "lesson") score += 2.4;
      if (defines && (doc.k === "game" || doc.k === "media" || doc.k === "hint") && !titled) score *= 0.35;
      score *= KIND_WEIGHT[doc.k] || 1;
      if (score > 0) ranked.push({ doc, score });
    }
    ranked.sort((a, b) => b.score - a.score || String(a.doc.ti).localeCompare(String(b.doc.ti)));
    return ranked.slice(0, limit).map((row) => ({
      href: row.doc.h,
      title: row.doc.ti,
      score: Math.round(row.score * 100) / 100,
      kind: row.doc.k,
      section: row.doc.s || "",
      id: row.doc.i,
    }));
  }

  function docBy(pred) {
    return docs.find(pred) || null;
  }

  function fromDoc(doc, mode, intent, follow, followQ) {
    const link = doc.k === "lesson" ? "Open this lesson" : "Open this page";
    return emptyAnswer({
      mode,
      intent,
      text: clip(doc.ex),
      href: doc.h,
      link,
      example: "",
      follow: follow || doc.fu || "",
      followQ: followQ || doc.fq || "",
      act: doc.act || "",
      hits: [{ href: doc.h, title: doc.ti, score: 1, kind: doc.k, section: doc.s || "", id: doc.i }],
    });
  }

  function wordKnown(word) {
    return Boolean(word) && (knownSet.has(word) || knownSet.has(stem(word)) || Boolean(syn[word]) || Boolean(syn[stem(word)]));
  }

  function fixTypos(word, allowFuzzy) {
    if (!word || STOP.has(word) || wordKnown(word)) return word;
    const collapsed = collapseToKnown(word, wordKnown);
    if (collapsed) return collapsed;
    if (word.length <= 4) {
      const stopFix = fuzzy(word, STOP_WORDS, 1);
      if (stopFix) return stopFix;
    }
    if (!allowFuzzy) return word;
    const fix = fuzzy(word, pool, 0, freq);
    if (fix) return fix;
    if (word.length <= 4) {
      const small = fuzzy(word, seedPool, 1, freq);
      if (small) return small;
    }
    return word;
  }

  function prepare(text) {
    const normalized = normalize(text);
    const raws = normalized.split(" ").filter(Boolean);
    const unknown = raws.filter((raw) => !STOP.has(raw) && !wordKnown(raw) && !collapseToKnown(raw, wordKnown));
    const allowFuzzy = unknown.length < 3;
    const corrected = raws.map((raw) => fixTypos(raw, allowFuzzy));
    const forms = new Set();
    const content = [];
    for (const word of corrected) {
      const pieces = new Set([word, stem(word), canon(word, syn)]);
      if (word.endsWith("ing") && word.length > 6) {
        const base = word.slice(0, -3);
        pieces.add(base);
        pieces.add(`${base}e`);
      }
      pieces.forEach((part) => {
        if (part) forms.add(part);
      });
      if (!word || word.length < 2 || (STOP.has(word) && word !== "if")) continue;
      const term = canon(word, syn);
      if (!term || term.length < 2 || (STOP.has(term) && term !== "if")) continue;
      content.push(term);
      forms.add(term);
    }
    const how = /^(how (do|does|to|can|should)|how to)\b/.test(normalized);
    if (/\bover and over\b|\bagain and again\b/.test(normalized)) {
      forms.add("loop");
      content.push("loop");
    }
    const addForm = (term) => {
      forms.add(term);
      content.push(term);
    };
    if (/\bf\b/.test(normalized) && /\b(string|quote|quotes|brace|braces)\b/.test(normalized)) addForm("fstring");
    if (/\b(uppercase|lowercase|capital|capitals)\b/.test(normalized)) addForm("upper");
    if (/\b(both ends|each end)\b/.test(normalized) && /\b(space|spaces|whitespace|text|string)\b/.test(normalized)) addForm("strip");
    if (/\binto words\b/.test(normalized) || (/\bbreak\b/.test(normalized) && /\bwords\b/.test(normalized))) addForm("split");
    if (/\b(swap|replace)\b/.test(normalized) && /\b(word|text|string|substring)\b/.test(normalized)) addForm("replace");
    if (/\blowercase\b|\blower case\b|\bsmall letters\b|\blowercase\b/.test(normalized)) addForm("lower");
    if (/\bduplicate\b/.test(normalized) && /\blist\b/.test(normalized)) addForm("copy");
    if (/\b(from zero|not including|up to but)\b/.test(normalized)) addForm("range");
    if (/\bcount\b/.test(normalized) && /\b(each|letter|letters|times)\b/.test(normalized)) addForm("counter");
    if (/\bfirst\b/.test(normalized) && /\b(item|items|sequence|elements)\b/.test(normalized) && /\b(two|three|four|five|only)\b/.test(normalized)) addForm("slice");
    if (/\bin one line\b/.test(normalized) && /\b(pair|tuple|names)\b/.test(normalized)) addForm("unpack");
    return { forms, content, how };
  }

  function stickToTopic(q) {
    if (!memory || !memory.topic) return q;
    const prepared = prepare(q);
    const named = ["list", "tuple", "dict", "string", "function", "file", "loop", "class", "module", "error", "sort", "set"].filter((term) => prepared.forms.has(term));
    if (named.some((term) => term !== memory.topic)) return q;
    if (named.includes(memory.topic)) return q;
    const sticky = new Set("add new key value item another put store fresh insert update change extra under".split(" "));
    const content = prepared.content.filter((term) => !FILLER.has(term));
    if (!content.length || !content.every((term) => sticky.has(term) || AMBIGUOUS.has(term))) return q;
    return `${q} ${memory.topic}`;
  }

  function topicFrom(raw, fallbackTitle) {
    const prepared = prepare(raw);
    const prefer = ["string", "list", "tuple", "dict", "function", "file", "loop", "class", "module", "error", "set", "print", "comment"];
    for (const term of prefer) {
      if (prepared.forms.has(term)) return term;
    }
    return fallbackTitle || "";
  }

  function remember(doc, raw, topic) {
    memory = {
      href: doc.h,
      title: doc.ti,
      example: doc.eg || "",
      frame: frameOf(raw),
      kind: doc.k,
      act: doc.act || "",
      link: doc.k === "lesson" ? "Open this lesson" : "Open this page",
      topic: topic || topicFrom(raw, doc.titleNorm),
    };
  }

  function matchSeed(text) {
    const prepared = prepare(text);
    let best = null;
    let bestScore = 0;
    for (const seed of seeds) {
      if (seed.block && seed.block.some((term) => prepared.forms.has(term))) continue;
      if (seed.all && seed.all.length && !seed.all.every((term) => prepared.forms.has(term))) continue;
      const anyHit = seed.any && seed.any.some((term) => prepared.forms.has(term));
      const allowHits = (seed.allow || []).filter((term) => prepared.forms.has(term)).length;
      if (seed.any && seed.any.length && !anyHit && !(prepared.how && allowHits >= 3)) continue;
      if ((!seed.all || !seed.all.length) && (!seed.any || !seed.any.length)) continue;
      const skipAllow = Boolean(seed.loose) || (prepared.how && seed.how !== false);
      if (!skipAllow && seed.allow && seed.allow.length) {
        const allow = new Set([...(seed.allow || []), ...(seed.all || []), ...(seed.any || [])]);
        [...allow].forEach((term) => {
          allow.add(stem(term));
          const canonical = canon(term, syn);
          if (canonical) allow.add(canonical);
        });
        const extra = prepared.content.filter((term) => {
          if (allow.has(term) || FILLER.has(term) || /^\d+$/.test(term)) return false;
          if (term === "if" && !(seed.any || []).includes("if") && !(seed.all || []).includes("if")) return false;
          return true;
        });
        if (extra.length) continue;
      }
      let score = seed.rank || 0;
      if (seed.all) score += seed.all.length * 12;
      if (seed.any) score += seed.any.filter((term) => prepared.forms.has(term)).length * 8;
      score += prepared.content.filter((term) => (
        (seed.allow || []).includes(term) || (seed.all || []).includes(term) || (seed.any || []).includes(term)
      )).length;
      if (score > bestScore) {
        bestScore = score;
        best = seed;
      }
    }
    return best;
  }

  function fromSeed(seed, raw) {
    const link = seed.k === "lesson" ? "Open this lesson" : "Open this page";
    memory = {
      href: seed.h,
      title: seed.ti,
      example: seed.eg || "",
      frame: frameOf(raw),
      kind: seed.k || "page",
      act: "",
      link,
      topic: seed.topic || topicFrom(raw, normalize(seed.ti)),
    };
    return emptyAnswer({
      mode: "answer",
      intent: "seed",
      text: clip(seed.ex),
      href: seed.h,
      link,
      example: "",
      follow: seed.eg ? "Show an example" : "Where do I start?",
      followQ: seed.eg ? "Show an example" : "Where do I start?",
      hits: [{ href: seed.h, title: seed.ti, score: 1, kind: seed.k || "page", section: "", id: seed.i }],
    });
  }

  function isConfident(top, second, qTerms, doc, nq) {
    if (!top || !doc || top.score < MIN_SCORE) return false;
    const unique = [...new Set(qTerms)];
    const known = unique.filter((term) => df.has(term));
    const matched = known.filter((term) => doc.tf.has(term) || doc.ttf.has(term));
    const coverage = known.length ? matched.length / known.length : 0;
    const titleTerms = doc.title.filter((term) => known.includes(term));
    const titlePhrase = doc.titleNorm.length >= 4 && ` ${nq} `.includes(` ${doc.titleNorm} `);
    const margin = !second || second.href === top.href ? top.score : top.score - second.score;
    const ratio = !second || second.href === top.href || second.score <= 0 ? 99 : top.score / second.score;
    if (titlePhrase && coverage >= 0.34) return true;
    if (titleTerms.some((term) => term.length >= 3) && coverage >= 0.5 && top.score >= 3 && ratio >= 1.08) return true;
    if (coverage < 0.67) return false;
    if (second && second.href !== top.href && margin < MIN_MARGIN && ratio < 1.22) return false;
    return true;
  }

  function fallbackAnswer(hits, followMode, quiet = false) {
    const closest = quiet ? [] : (hits || [])
      .filter((hit) => hit.kind === "lesson" || hit.kind === "slide" || hit.kind === "guide" || hit.kind === "glossary")
      .slice(0, 2)
      .map((hit) => ({ href: hit.href, title: hit.title }));
    const tail = closest.length
      ? ` Closest pages: ${closest.map((item) => item.title).join("; ")}.`
      : "";
    const stuck = followMode && memory
      ? ` I was still on “${memory.title}”, and that follow-up is not in these pages.`
      : "";
    return emptyAnswer({
      mode: "fallback",
      intent: "fallback",
      text: `I don't have that yet.${stuck}${tail} I only answer from this lab's lessons. You can also use Search.`,
      act: "search",
      closest,
      hits: hits || [],
      follow: closest[0] && !followMode ? `What about ${closest[0].title}?` : "Where do I start?",
      followQ: closest[0] && !followMode ? closest[0].title : "Where do I start?",
    });
  }

  function intentAnswer(name, doc, text, extra = {}) {
    const answer = doc ? fromDoc(doc, "intent", name, extra.follow, extra.followQ) : emptyAnswer({ mode: "intent", intent: name, text });
    if (text) answer.text = text;
    if (extra.href) answer.href = extra.href;
    if (extra.link) answer.link = extra.link;
    if (extra.act) answer.act = extra.act;
    if (extra.follow) answer.follow = extra.follow;
    if (extra.followQ) answer.followQ = extra.followQ;
    if (doc) remember(doc, extra.raw || name);
    return answer;
  }

  function listTitles(kind, max = 6) {
    return docs.filter((doc) => doc.k === kind).slice(0, max).map((doc) => doc.ti);
  }

  function route(raw, host) {
    const q = normalize(raw);
    if (!q) return emptyAnswer({ text: "Type a question about a lesson in this lab." });
    if (injection(raw)) {
      memory = null;
      return emptyAnswer({
        mode: "fallback",
        intent: "injection",
        text: "I don't have that yet. I only answer from this lab's lessons, and I can't change that. Try a contact-center question from this lab, or use Search.",
        follow: "Where do I start?",
        followQ: "Where do I start?",
        act: "search",
      });
    }
    const chat = smallTalk(q);
    if (chat) return chat;
    if (memory && /^(?:please )?(?:(?:can|could) you )?(?:show|give)(?: me)?(?: a| an)? (?:short |small )?(?:example|sample)(?: of (?:that|it|this))?[. ]*$/.test(q)) {
      if (!memory.example) {
        return emptyAnswer({
          mode: "answer",
          intent: "example",
          text: `The page “${memory.title}” has no short example stored in the chat index. Open it to read the full text.`,
          href: memory.href,
          link: memory.link,
          follow: "Where do I start?",
          followQ: "Where do I start?",
        });
      }
      return emptyAnswer({
        mode: "answer",
        intent: "example",
        text: `An example from “${memory.title}”.`,
        href: memory.href,
        link: memory.link,
        example: memory.example,
        act: memory.act,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (memory && /^(open it|open that|go there|take me there)[. ]*$/.test(q)) {
      return emptyAnswer({
        mode: "intent",
        intent: "open",
        text: `Opening “${memory.title}”.`,
        href: memory.href,
        link: memory.link,
        act: memory.act,
      });
    }
    let searchText = raw;
    let followMode = false;
    const follow = q.match(/^(?:and |also |plus |what about |how about |ok and )(.+)$/);
    const anaphora = memory && /\b(it|that|them|those)\b/.test(q);
    if (memory && (follow || anaphora)) {
      let rest = (follow ? follow[1] : q).replace(/[?.!]+/g, "").trim();
      rest = rest.replace(/\b(it|that|them|those)\b/g, memory.topic || memory.title || "");
      if (!/^(how|what|why|where|when)\b/.test(rest)) rest = `${memory.frame} ${rest}`.trim();
      searchText = rest;
      followMode = true;
    }
    searchText = stickToTopic(searchText);
    if (/\b(play|open|start)\b.*\b(game|games|drills?|puzzles?)\b|\b(games|drills|puzzles)\b[. ]*$|what games|\bpuzzles?\b|practice drills/.test(q)) {
      const named = gameNamed(q);
      if (named) return intentAnswer("game", named, clip(named.ex), { raw, follow: "Show downloads", followQ: "Show downloads" });
      const games = docBy((doc) => doc.h === "play.html" || doc.i === "page:play");
      const names = listTitles("game", 8);
      const text = names.length
        ? `Drills in this lab: ${names.join(", ")}. They are simulations. They do not call Amazon Connect.`
        : "Play holds short drills that run in this browser. They do not call Amazon Connect.";
      return intentAnswer("game", games, text, { href: "play.html", link: "Open Play", raw, follow: "Where do I start?", followQ: "Where do I start?" });
    }
    const namedGame = /\b(play|open|game)\b/.test(q) ? gameNamed(q) : gameNamed(q, true);
    if (namedGame && /\b(play|open|game|start)\b/.test(q)) {
      return intentAnswer("game", namedGame, clip(namedGame.ex), { raw });
    }
    if (/\b(audio|listen|spoken|hear the|play audio|sound lesson|out loud)\b/.test(q) || /\bread (a |the )?lesson\b/.test(q)) {
      const media = docs.filter((doc) => doc.k === "media" && doc.act === "audio");
      const page = docBy((doc) => doc.i === "page:listen") || media[0] || null;
      const text = media.length
        ? `Spoken audio in this lab: ${media.map((doc) => doc.ti).join("; ")}.`
        : "Listen holds short study audio clips. They are synthesized, not a live system.";
      return intentAnswer("audio", page, text, {
        href: "listen.html",
        link: "Open Listen",
        act: "audio",
        raw,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/\b(video|videos|clip|clips|animation|gif)\b/.test(q)) {
      const media = docs.filter((doc) => doc.k === "media" && doc.act === "video");
      const page = docBy((doc) => doc.i === "page:flows") || media[0] || null;
      const text = media.length
        ? `Short clips in this lab: ${media.map((doc) => doc.ti).join("; ")}.`
        : "Animated flows are on the Flows page. They are pictures of this lab, not a live call.";
      return intentAnswer("video", page, text, {
        href: "flows.html",
        link: "Open Flows",
        act: "video",
        raw,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/\b(downloads?|downloadable|cheat sheets?|cheatsheets?)\b/.test(q)) {
      const rows = docs.filter((doc) => doc.k === "download");
      const text = rows.length
        ? `Downloads in this lab: ${rows.slice(0, 8).map((doc) => doc.ti).join("; ")}.`
        : "Sheets, cards, and the zip are on the downloads page.";
      const page = docBy((doc) => doc.i === "page:downloads") || rows[0];
      return intentAnswer("downloads", page, text, {
        href: "downloads.html",
        link: "Open downloads",
        raw,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/\b(where (do|should) i start|how (do|should|can) i (start|begin)|how to (start|begin)|getting started|first lesson|start here|begin here|beginner begin|where should i begin|where can i begin|where do i begin|i m lost|im lost|newcomer|first page)\b/.test(q) || /\bwhere can\b.*\b(start|begin|open)\b/.test(q)) {
      const doc = docBy((item) => item.i === "page:start");
      const text = doc ? `Start with “${doc.ti}”. ${clip(doc.ex, 220)}` : "Start with the ten-minute path on the start page.";
      return intentAnswer("start", doc, text, { href: "start.html", link: "Open the start page", raw, follow: "What can you help with?", followQ: "What can you help with?" });
    }
    if (/\b(what level am i|whats my level|what is my level|my progress|how far am i|how many lessons have i)\b/.test(q) || (/\bhow far\b/.test(q) && /\b(am i|along)\b/.test(q))) {
      const info = host && typeof host.progress === "function" ? host.progress() : null;
      const done = info && Number.isFinite(info.done) ? info.done : 0;
      const total = info && Number.isFinite(info.total) ? info.total : 0;
      const xpLevel = info && Number.isFinite(info.xpLevel) ? info.xpLevel : 1;
      let text = `On this device the XP counter is level ${xpLevel}. `;
      text += total ? `You have opened ${done} of ${total} lessons. ` : "I can't see a lesson count yet. ";
      text += "That is browser storage, not a judgement of your skill.";
      const next = info && info.nextHref ? info : null;
      return emptyAnswer({
        mode: "intent",
        intent: "level",
        text,
        href: next ? next.nextHref : "start.html",
        link: next ? "Open the next unopened lesson" : "Open the start page",
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/\b(how do i run|run my code|run the code|run code|practice desk|where can i run|where do i run|routing desk|call flow sim)\b/.test(q)) {
      const doc = docBy((item) => item.i === "page:sim") || docBy((item) => item.i === "page:play");
      const text = "The routing desk and the Play drills run in this browser. They are simulations. They do not call Amazon Connect.";
      return intentAnswer("run", doc, text, {
        href: "sim.html",
        link: "Open the routing desk",
        raw,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/\b(levels|worlds)\b/.test(q) && /\b(list|course|lab|which|what|show|many)\b/.test(q)) {
      const rows = docs.filter((doc) => doc.k === "level");
      const text = rows.length
        ? `This lab has ${rows.length} topic worlds, from ${rows[0].ti} through ${rows[rows.length - 1].ti}. They are study paths, not an exam syllabus.`
        : "Chapters group the rooms into study paths. Open Chapters to see them.";
      const page = docBy((doc) => doc.i === "page:chapters") || rows[0];
      return intentAnswer("levels", page, text, {
        href: "chapters/index.html",
        link: "Open the chapters",
        raw,
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    const HELP_TEXT = "I look up this lab's lessons and answer with a quoted excerpt and a page link. Topics: queues, routing profiles, contact flows, Lex, Lambda, the CCP, Contact Lens, CTR, and the bridges from UCCE, Genesys, and Webex. I don't answer from outside the lab.";
    if (/\b(what can you do|what do you do|what can you help|how can you help|what are you able to do|what topics|which topics|topics can you)\b/.test(q)) {
      return emptyAnswer({
        mode: "intent",
        intent: "help",
        text: HELP_TEXT,
        href: "",
        link: "",
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    if (/^(help|help me|help please)[. ]*$/.test(q) || /help me use/.test(q) || /how (do i|to|can i) use (this )?(site|lab)/.test(q) || (/\bhelp\b/.test(q) && /\b(site|lab|using)\b/.test(q))) {
      return emptyAnswer({
        mode: "intent",
        intent: "help",
        text: HELP_TEXT,
        href: "",
        link: "",
        follow: "Where do I start?",
        followQ: "Where do I start?",
      });
    }
    return { searchText, followMode };
  }

  function gameNamed(q, bare = false) {
    const rows = docs.filter((doc) => doc.k === "game");
    let best = null;
    for (const doc of rows) {
      const name = doc.titleNorm;
      if (!name || name.length < 4) continue;
      if (q.includes(name) || (!bare && name.split(" ").some((part) => part.length > 4 && q.includes(part)))) best = doc;
    }
    return best;
  }

  function ask(raw, host) {
    const limited = String(raw || "").slice(0, 400);
    const routed = route(limited, host || {});
    if (!routed.searchText) return routed;
    if (!hasDomainTerm(routed.searchText, domain, syn, pool, freq)) return fallbackAnswer([], routed.followMode, true);
    const seed = matchSeed(routed.searchText);
    if (seed) return fromSeed(seed, limited);
    const qTerms = queryTokens(routed.searchText, syn, pool, knownSet, seedPool, freq);
    const indexed = qTerms.filter((term) => df.has(term));
    const topical = indexed.filter((term) => !/^\d+$/.test(term));
    const unknownTerms = qTerms.filter((term) => !df.has(term));
    if (qTerms.length && !topical.length) return fallbackAnswer([], routed.followMode);
    if (unknownTerms.length > indexed.length && indexed.length <= 1) return fallbackAnswer([], routed.followMode);
    const hits = search(routed.searchText, 4);
    const top = hits[0];
    const second = hits[1];
    const topDoc = top ? docs.find((doc) => doc.i === top.id) : null;
    const nq = normalize(routed.searchText);
    if (!isConfident(top, second, qTerms, topDoc, nq)) return fallbackAnswer(hits, routed.followMode);
    const follow = topDoc.eg
      ? "Show an example"
      : (second && second.href !== top.href ? `What about ${second.title}?` : (topDoc.fu || "Where do I start?"));
    const followQ = topDoc.eg
      ? "Show an example"
      : (second && second.href !== top.href ? second.title : (topDoc.fq || "Where do I start?"));
    remember(topDoc, limited);
    return emptyAnswer({
      mode: "answer",
      intent: "",
      text: clip(topDoc.ex),
      href: topDoc.h,
      link: topDoc.k === "lesson" ? "Open this lesson" : "Open this page",
      example: "",
      follow,
      followQ,
      act: topDoc.act || "",
      hits: hits.slice(0, 3),
    });
  }

  return {
    ask,
    search,
    reset() { memory = null; },
  };
}
