import assert from "node:assert/strict";
import test from "node:test";
import { matchIntent } from "./engine.mjs";

const kb = {
  pages: [
    { title: "Downloads", href: "downloads.html", words: ["cheat"] },
    { title: "Start", href: "start.html", words: ["learn"] }
  ],
  rooms: [
    { title: "Queues wait", href: "rooms/route-queue.html", why: "Profiles decide who is eligible.", words: ["queue", "queues"] }
  ]
};

test("download intent", function () {
  const hit = matchIntent("just download the zip", kb);
  assert.equal(hit.href, "downloads.html");
});

test("ten minute intent", function () {
  const hit = matchIntent("Finish in 10 minutes", kb);
  assert.equal(hit.href, "start.html#ten");
});

test("full course intent", function () {
  const hit = matchIntent("full course please", kb);
  assert.equal(hit.href, "index.html#rooms");
});

test("room word", function () {
  const hit = matchIntent("show me queues", kb);
  assert.equal(hit.href, "rooms/route-queue.html");
});

test("unknown stays honest", function () {
  const hit = matchIntent("quantum payroll ledger", kb);
  assert.equal(hit.href, "");
  assert.match(hit.say, /do not know/i);
});
