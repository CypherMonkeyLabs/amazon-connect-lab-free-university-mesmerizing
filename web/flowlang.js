/**
 * Amazon Connect flow-language import and export.
 * Shape follows the Connect Customer flow language, version 2019-10-30:
 * https://docs.aws.amazon.com/connect/latest/devguide/flow-language-example.html
 * https://docs.aws.amazon.com/connect/latest/devguide/flow-language-actions.html
 */

export const FLOW_DOCS = [
  { title: "Example flow", url: "https://docs.aws.amazon.com/connect/latest/devguide/flow-language-example.html" },
  { title: "Actions", url: "https://docs.aws.amazon.com/connect/latest/devguide/flow-language-actions.html" },
  { title: "Set logging behavior", url: "https://docs.aws.amazon.com/connect/latest/devguide/flow-control-actions-updateflowloggingbehavior.html" },
  { title: "Check hours of operation", url: "https://docs.aws.amazon.com/connect/latest/devguide/flow-control-actions-checkhoursofoperation.html" },
  { title: "Get customer input", url: "https://docs.aws.amazon.com/connect/latest/devguide/participant-actions-getparticipantinput.html" },
  { title: "Invoke Lambda", url: "https://docs.aws.amazon.com/connect/latest/devguide/interactions-invokelambdafunction.html" },
  { title: "Set working queue", url: "https://docs.aws.amazon.com/connect/latest/devguide/contact-actions-updatecontacttargetqueue.html" },
  { title: "Transfer to queue", url: "https://docs.aws.amazon.com/connect/latest/devguide/contact-actions-transfercontacttoqueue.html" },
  { title: "Lambda error values", url: "https://docs.aws.amazon.com/connect/latest/devguide/testing-language-actions-override-system-behavior.html" },
];

export const PALETTE = [
  "Flow entry",
  "Set logging behavior",
  "Check hours of operation",
  "Get customer input",
  "AWS Lambda function",
  "Set contact attributes",
  "Set working queue",
  "Transfer to queue",
  "Play prompt",
  "Disconnect / hang up",
  "End flow / Resume",
];

export const PORTS = {
  "Flow entry": ["Next"],
  "Set logging behavior": ["Success"],
  "Check hours of operation": ["In hours", "Out of hours"],
  "Get customer input": ["1", "2", "Timeout", "Error"],
  "AWS Lambda function": ["Success", "Error", "Timeout"],
  "Set contact attributes": ["Success"],
  "Set working queue": ["Success"],
  "Transfer to queue": ["At capacity", "Error"],
  "Play prompt": ["Success"],
  "Disconnect / hang up": [],
  "End flow / Resume": [],
};

const TYPE_BY_LABEL = {
  "Set logging behavior": "UpdateFlowLoggingBehavior",
  "Check hours of operation": "CheckHoursOfOperation",
  "Get customer input": "GetParticipantInput",
  "AWS Lambda function": "InvokeLambdaFunction",
  "Set contact attributes": "UpdateContactAttributes",
  "Set working queue": "UpdateContactTargetQueue",
  "Transfer to queue": "TransferContactToQueue",
  "Play prompt": "MessageParticipant",
  "Disconnect / hang up": "DisconnectParticipant",
  "End flow / Resume": "EndFlowExecution",
};

const LABEL_BY_TYPE = Object.fromEntries(Object.entries(TYPE_BY_LABEL).map(([k, v]) => [v, k]));

const FORBIDDEN_ID = /[%:(\\)/=$,;\[\]{}]/;
const FORBIDDEN_WORDS = new Set(["__proto__", "constructor", "__defineGetter__", "__defineSetter__", "toString", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "valueOf"]);

const EXAMPLE_QUEUE = "arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/queue/22222222-2222-2222-2222-222222222222";
const EXAMPLE_LAMBDA = "arn:aws:lambda:us-west-2:123456789012:function:connect-flow-hook";

function parametersFor(label) {
  if (label === "Set logging behavior") return { FlowLoggingBehavior: "Enabled" };
  if (label === "Check hours of operation") return {};
  if (label === "Get customer input") {
    return {
      Text: "Press 1 for order status. Press 2 for an agent.",
      StoreInput: "False",
      InputTimeLimitSeconds: "5",
    };
  }
  if (label === "AWS Lambda function") {
    return {
      LambdaFunctionARN: EXAMPLE_LAMBDA,
      InvocationTimeLimitSeconds: "8",
      InvocationType: "SYNCHRONOUS",
      ResponseValidation: { ResponseType: "STRING_MAP" },
    };
  }
  if (label === "Set contact attributes") {
    return { Attributes: { CampusLab: "order-status" }, TargetContact: "Current" };
  }
  if (label === "Set working queue") return { QueueId: EXAMPLE_QUEUE };
  if (label === "Play prompt") return { Text: "Thank you for calling." };
  return {};
}

function emptyTransitions(type) {
  if (type === "DisconnectParticipant" || type === "EndFlowExecution") return {};
  return { NextAction: "", Errors: [], Conditions: [] };
}

function edgeTarget(edges, from, port) {
  const hit = edges.find((e) => e.from === from && e.port === port);
  return hit ? hit.to : "";
}

export function exportFlow(state) {
  const nodes = (state && state.nodes) || [];
  const edges = (state && state.edges) || [];
  const issues = [];
  const warnings = [];
  const entry = nodes.find((n) => n.type === "Flow entry");
  const actions = nodes.filter((n) => n.type !== "Flow entry");
  if (!actions.length) issues.push("Add at least one action after the flow entry.");
  if (actions.length > 250) issues.push("A flow can define at most 250 actions.");

  const byId = new Map(actions.map((n) => [n.uid, n]));
  actions.forEach((n) => {
    if (!n.uid || n.uid.length > 50) issues.push("Identifier " + n.uid + " must be 1 to 50 characters.");
    if (FORBIDDEN_ID.test(n.uid || "")) issues.push("Identifier " + n.uid + " contains a character the flow language rejects.");
    if (FORBIDDEN_WORDS.has(n.uid)) issues.push("Identifier " + n.uid + " is a reserved word.");
    if (!TYPE_BY_LABEL[n.type]) issues.push("No flow-language type for " + n.type + ".");
  });

  let start = "";
  if (entry) {
    start = edgeTarget(edges, entry.uid, "Next");
    if (!start) issues.push("Connect the flow entry Next port to the first action.");
    else if (!byId.has(start)) issues.push("Flow entry Next points at a missing block.");
  } else if (actions[0]) {
    start = actions[0].uid;
    warnings.push("No flow entry block. StartAction is the first action.");
  }

  const actionJson = actions.map((n) => {
    const type = TYPE_BY_LABEL[n.type];
    const transitions = emptyTransitions(type);
    const ports = PORTS[n.type] || [];
    const requirePort = (port, message) => {
      const to = edgeTarget(edges, n.uid, port);
      if (!to) issues.push(message);
      else if (!byId.has(to)) issues.push(n.type + " " + port + " points at a missing block.");
      return to;
    };
    const optionalPort = (port) => {
      const to = edgeTarget(edges, n.uid, port);
      if (to && !byId.has(to)) issues.push(n.type + " " + port + " points at a missing block.");
      if (!to) warnings.push(n.type + " has no " + port + " branch.");
      return to;
    };

    if (type === "CheckHoursOfOperation") {
      const inn = requirePort("In hours", "Check hours of operation needs an In hours branch (Equals True).");
      const out = requirePort("Out of hours", "Check hours of operation needs an Out of hours branch (Equals False).");
      transitions.NextAction = inn || "";
      transitions.Conditions = [];
      if (inn) transitions.Conditions.push({ NextAction: inn, Condition: { Operator: "Equals", Operands: ["True"] } });
      if (out) transitions.Conditions.push({ NextAction: out, Condition: { Operator: "Equals", Operands: ["False"] } });
    } else if (type === "GetParticipantInput") {
      const one = optionalPort("1");
      const two = optionalPort("2");
      const timeout = optionalPort("Timeout");
      const error = optionalPort("Error");
      transitions.Conditions = [];
      if (one) transitions.Conditions.push({ NextAction: one, Condition: { Operator: "Equals", Operands: ["1"] } });
      if (two) transitions.Conditions.push({ NextAction: two, Condition: { Operator: "Equals", Operands: ["2"] } });
      transitions.NextAction = one || two || "";
      transitions.Errors = [];
      if (timeout) transitions.Errors.push({ NextAction: timeout, ErrorType: "InputTimeLimitExceeded" });
      if (error) transitions.Errors.push({ NextAction: error, ErrorType: "NoMatchingCondition" });
    } else if (type === "InvokeLambdaFunction") {
      const ok = optionalPort("Success");
      const err = optionalPort("Error");
      const timeout = optionalPort("Timeout");
      transitions.NextAction = ok || "";
      transitions.Errors = [];
      if (timeout) transitions.Errors.push({ NextAction: timeout, ErrorType: "TimeLimitExceeded" });
      if (err) transitions.Errors.push({ NextAction: err, ErrorType: "NoMatchingError" });
      if (!ok) issues.push("AWS Lambda function needs a Success branch (NextAction).");
    } else if (type === "TransferContactToQueue") {
      const capacity = optionalPort("At capacity");
      const err = optionalPort("Error");
      transitions.NextAction = "";
      transitions.Errors = [];
      if (capacity) transitions.Errors.push({ NextAction: capacity, ErrorType: "QueueAtCapacity" });
      if (err) transitions.Errors.push({ NextAction: err, ErrorType: "NoMatchingError" });
    } else if (type === "DisconnectParticipant" || type === "EndFlowExecution") {
      /* terminating — Transitions stays {} */
    } else if (type === "UpdateFlowLoggingBehavior") {
      const ok = optionalPort("Success");
      transitions.NextAction = ok || "";
      transitions.Errors = [];
      transitions.Conditions = [];
      if (!ok) issues.push("Set logging behavior needs a Success branch.");
    } else {
      ports.forEach((port) => {
        const to = optionalPort(port);
        if (to && transitions.NextAction === "") transitions.NextAction = to;
      });
    }
    return {
      Identifier: n.uid,
      Type: type,
      Parameters: parametersFor(n.type),
      Transitions: transitions,
    };
  });

  const metadata = {
    EntryPointPosition: entry ? { x: Math.round(entry.x), y: Math.round(entry.y) } : { x: 40, y: 40 },
    ActionMetadata: {},
    name: "Campus order status",
    description: "Exported from Amazon Connect Lab. Replace example ARNs before you publish.",
    type: "contactFlow",
    status: "published",
  };
  actions.forEach((n) => {
    metadata.ActionMetadata[n.uid] = { Position: { x: Math.round(n.x), y: Math.round(n.y) } };
  });

  const flow = {
    Version: "2019-10-30",
    StartAction: start,
    Metadata: metadata,
    Actions: actionJson,
  };
  const checked = validateFlow(flow);
  checked.errors.forEach((e) => { if (!issues.includes(e)) issues.push(e); });
  checked.warnings.forEach((w) => { if (!warnings.includes(w)) warnings.push(w); });
  return { flow, errors: issues, warnings, valid: issues.length === 0 };
}

export function validateFlow(flow) {
  const errors = [];
  const warnings = [];
  if (!flow || typeof flow !== "object") return { errors: ["Flow JSON is not an object."], warnings, valid: false };
  if (flow.Version !== "2019-10-30") errors.push("Version must be 2019-10-30. That is the only flow-language version.");
  if (!Array.isArray(flow.Actions)) errors.push("Actions must be an array.");
  const actions = Array.isArray(flow.Actions) ? flow.Actions : [];
  if (actions.length > 250) errors.push("A flow can define at most 250 actions.");
  const ids = new Set();
  actions.forEach((action) => {
    if (!action || typeof action !== "object") { errors.push("An action is not an object."); return; }
    const id = action.Identifier;
    if (typeof id !== "string" || !id || id.length > 50) errors.push("Each Identifier must be a string of 1 to 50 characters.");
    else if (ids.has(id)) errors.push("Duplicate Identifier " + id + ".");
    else ids.add(id);
    if (typeof id === "string" && (FORBIDDEN_ID.test(id) || FORBIDDEN_WORDS.has(id))) errors.push("Identifier " + id + " is not allowed.");
    if (typeof action.Type !== "string" || !action.Type) errors.push("Action " + id + " is missing Type.");
    else if (!LABEL_BY_TYPE[action.Type]) warnings.push("Type " + action.Type + " is not in this builder's palette. It will import as a labeled block.");
    if (!action.Parameters || typeof action.Parameters !== "object" || Array.isArray(action.Parameters)) errors.push("Action " + id + " needs a Parameters object.");
    if (!action.Transitions || typeof action.Transitions !== "object") errors.push("Action " + id + " needs a Transitions object.");
    if (action.Type === "CheckHoursOfOperation") {
      const conditions = (action.Transitions && action.Transitions.Conditions) || [];
      const ops = conditions.map((c) => c && c.Condition && c.Condition.Operands && c.Condition.Operands[0]);
      if (!ops.includes("True") || !ops.includes("False")) errors.push("CheckHoursOfOperation requires Equals True and Equals False conditions.");
    }
    if (action.Type === "InvokeLambdaFunction" && action.Parameters) {
      const limit = Number(action.Parameters.InvocationTimeLimitSeconds);
      if (!Number.isInteger(limit) || limit < 1 || limit > 8) errors.push("InvocationTimeLimitSeconds must be an integer from 1 to 8.");
      const mode = action.Parameters.InvocationType;
      if (mode && mode !== "SYNCHRONOUS" && mode !== "ASYNCHRONOUS") errors.push("InvocationType must be SYNCHRONOUS or ASYNCHRONOUS.");
    }
    if (action.Type === "GetParticipantInput" && action.Parameters) {
      const limit = Number(action.Parameters.InputTimeLimitSeconds);
      if (action.Parameters.InputTimeLimitSeconds != null && (!Number.isInteger(limit) || limit < 1)) {
        errors.push("InputTimeLimitSeconds must be an integer greater than zero.");
      }
    }
    if (action.Type === "UpdateFlowLoggingBehavior" && action.Parameters) {
      const mode = action.Parameters.FlowLoggingBehavior;
      if (mode !== "Enabled" && mode !== "Disabled") errors.push("FlowLoggingBehavior must be Enabled or Disabled.");
    }
  });
  if (typeof flow.StartAction !== "string" || !ids.has(flow.StartAction)) errors.push("StartAction must match an action Identifier.");
  const known = ids;
  actions.forEach((action) => {
    const t = action.Transitions || {};
    const refs = [];
    if (t.NextAction) refs.push(t.NextAction);
    (t.Errors || []).forEach((e) => { if (e && e.NextAction) refs.push(e.NextAction); });
    (t.Conditions || []).forEach((c) => { if (c && c.NextAction) refs.push(c.NextAction); });
    refs.forEach((ref) => {
      if (!known.has(ref)) errors.push("Transition from " + action.Identifier + " points at missing action " + ref + ".");
    });
  });
  const blob = JSON.stringify(flow);
  if (blob.includes("123456789012")) warnings.push("Example account 123456789012 is still in the JSON. Replace ARNs before you publish.");
  return { errors, warnings, valid: errors.length === 0 };
}

function positionOf(flow, id, index) {
  const meta = flow.Metadata || {};
  const bag = meta.ActionMetadata || meta.actionMetadata || {};
  const item = bag[id] || {};
  const pos = item.Position || item.position;
  if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) return { x: pos.x, y: pos.y };
  return { x: 40 + (index % 4) * 200, y: 40 + Math.floor(index / 4) * 140 };
}

export function importFlow(raw) {
  let parsed = raw;
  if (typeof raw === "string") {
    try { parsed = JSON.parse(raw); }
    catch (err) { return { ok: false, errors: ["That text is not JSON."], warnings: [], nodes: [], edges: [] }; }
  }
  if (parsed && typeof parsed.Content === "string") {
    try { parsed = JSON.parse(parsed.Content); }
    catch (err) { return { ok: false, errors: ["Content is not JSON."], warnings: [], nodes: [], edges: [] }; }
  } else if (parsed && parsed.Content && typeof parsed.Content === "object") {
    parsed = parsed.Content;
  }
  const report = validateFlow(parsed);
  if (!parsed || !Array.isArray(parsed.Actions)) return { ok: false, errors: report.errors, warnings: report.warnings, nodes: [], edges: [] };
  const nodes = [];
  const edges = [];
  const entryPos = (parsed.Metadata && (parsed.Metadata.EntryPointPosition || parsed.Metadata.entryPointPosition)) || { x: 16, y: 16 };
  nodes.push({ uid: "entry", type: "Flow entry", x: Number(entryPos.x) || 16, y: Number(entryPos.y) || 16 });
  parsed.Actions.forEach((action, index) => {
    const pos = positionOf(parsed, action.Identifier, index);
    const label = LABEL_BY_TYPE[action.Type] || action.Type;
    nodes.push({ uid: action.Identifier, type: label, x: pos.x, y: pos.y });
    const t = action.Transitions || {};
    if (action.Identifier === parsed.StartAction) edges.push({ from: "entry", port: "Next", to: action.Identifier });
    if (action.Type === "CheckHoursOfOperation") {
      (t.Conditions || []).forEach((c) => {
        const operand = c && c.Condition && c.Condition.Operands && c.Condition.Operands[0];
        const port = operand === "False" ? "Out of hours" : "In hours";
        if (c && c.NextAction) edges.push({ from: action.Identifier, port, to: c.NextAction });
      });
    } else if (action.Type === "GetParticipantInput") {
      (t.Conditions || []).forEach((c) => {
        const operand = c && c.Condition && c.Condition.Operands && c.Condition.Operands[0];
        if (c && c.NextAction && (operand === "1" || operand === "2")) edges.push({ from: action.Identifier, port: operand, to: c.NextAction });
      });
      (t.Errors || []).forEach((e) => {
        if (!e || !e.NextAction) return;
        const port = e.ErrorType === "InputTimeLimitExceeded" ? "Timeout" : "Error";
        edges.push({ from: action.Identifier, port, to: e.NextAction });
      });
    } else if (action.Type === "InvokeLambdaFunction") {
      if (t.NextAction) edges.push({ from: action.Identifier, port: "Success", to: t.NextAction });
      (t.Errors || []).forEach((e) => {
        if (!e || !e.NextAction) return;
        const port = e.ErrorType === "TimeLimitExceeded" ? "Timeout" : "Error";
        edges.push({ from: action.Identifier, port, to: e.NextAction });
      });
    } else if (action.Type === "TransferContactToQueue") {
      (t.Errors || []).forEach((e) => {
        if (!e || !e.NextAction) return;
        const port = e.ErrorType === "QueueAtCapacity" ? "At capacity" : "Error";
        edges.push({ from: action.Identifier, port, to: e.NextAction });
      });
    } else if (t.NextAction) {
      const port = (PORTS[label] || ["Success"])[0] || "Success";
      edges.push({ from: action.Identifier, port, to: t.NextAction });
    }
  });
  if (!edges.some((e) => e.from === "entry")) {
    report.warnings.push("StartAction did not match a block, so the entry port is unwired.");
  }
  return { ok: report.valid, errors: report.errors, warnings: report.warnings, nodes, edges, flow: parsed };
}

export function sampleOrderStatus() {
  return {
    nodes: [
      { uid: "n1", type: "Flow entry", x: 30, y: 30 },
      { uid: "n2", type: "Set logging behavior", x: 220, y: 30 },
      { uid: "n3", type: "Check hours of operation", x: 420, y: 30 },
      { uid: "n4", type: "Get customer input", x: 220, y: 180 },
      { uid: "n5", type: "Play prompt", x: 420, y: 180 },
      { uid: "n6", type: "Set working queue", x: 30, y: 320 },
      { uid: "n7", type: "Transfer to queue", x: 220, y: 320 },
      { uid: "n8", type: "Disconnect / hang up", x: 420, y: 320 },
    ],
    edges: [
      { from: "n1", port: "Next", to: "n2" },
      { from: "n2", port: "Success", to: "n3" },
      { from: "n3", port: "In hours", to: "n4" },
      { from: "n3", port: "Out of hours", to: "n5" },
      { from: "n4", port: "1", to: "n6" },
      { from: "n5", port: "Success", to: "n8" },
      { from: "n6", port: "Success", to: "n7" },
    ],
    seq: 9,
    pending: null,
  };
}

export function wireMissing(state) {
  const disconnect = state.nodes.find((n) => n.type === "Disconnect / hang up");
  if (!disconnect) return { added: 0, note: "Add a Disconnect / hang up block first." };
  let added = 0;
  state.nodes.forEach((n) => {
    (PORTS[n.type] || []).forEach((port) => {
      if (!state.edges.some((e) => e.from === n.uid && e.port === port)) {
        state.edges.push({ from: n.uid, port, to: disconnect.uid });
        added += 1;
      }
    });
  });
  return { added, note: added ? "Connected " + added + " open ports to Disconnect." : "Every port already has a branch." };
}
