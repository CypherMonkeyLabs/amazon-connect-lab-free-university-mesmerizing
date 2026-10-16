/** Match a short request to a page in this lab. No network. */

export function matchIntent(text, kb) {
  const q = String(text || "").toLowerCase().trim();
  const rooms = (kb && kb.rooms) || [];
  const pages = (kb && kb.pages) || [];
  if (!q) {
    return { href: "", say: "Type a page, a room, or a word from this lab.", pose: "think" };
  }
  if (/\b(download|zip|export|sheet|template|pptx|pdf)\b/.test(q)) {
    return {
      href: "downloads.html",
      say: "Downloads has the sheets, the cards, the templates, the deck, and the zip.",
      pose: "point"
    };
  }
  if ((/\b(10|ten)\b/.test(q) && /minute/.test(q)) || /finish in 10/.test(q)) {
    return { href: "start.html#ten", say: "The ten-minute path is on the start page.", pose: "wave" };
  }
  if (/full course|all rooms|whole course/.test(q)) {
    return { href: "index.html#rooms", say: "The full course is the track map on the home page.", pose: "cheer" };
  }
  if (/\b(help|tour|how do i)\b/.test(q)) {
    return { href: "help.html", say: "Help explains the menu, the tour, this bot, and the downloads.", pose: "wave" };
  }
  let best = null;
  let score = 0;
  function consider(item) {
    let s = 0;
    const title = String(item.title || "").toLowerCase();
    if (title && q.includes(title)) s += 6;
    (item.words || []).forEach(function (word) {
      if (word && q.includes(String(word).toLowerCase())) s += 2;
    });
    if (s > score) {
      score = s;
      best = {
        href: item.href,
        say: item.why ? item.title + ". " + item.why : item.title + " is in this lab.",
        pose: "point"
      };
    }
  }
  pages.forEach(consider);
  rooms.forEach(consider);
  if (best && score >= 2) return best;
  return {
    href: "",
    say: "I only know pages in this lab. I do not know that. Confirm product behavior in the cited source on the room.",
    pose: "think"
  };
}
