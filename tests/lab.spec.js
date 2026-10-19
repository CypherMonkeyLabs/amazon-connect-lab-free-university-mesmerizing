import { test, expect } from "@playwright/test";

async function quiet(page) {
  await page.addInitScript(() => {
    localStorage.setItem("acl-greet-v1", "done");
    localStorage.setItem("acl-tour-v1", "done");
    localStorage.setItem("acl-idle-stop", "1");
  });
}

test("home, guide chat, and a lesson", async ({ page }, testInfo) => {
  await quiet(page);
  await page.goto("/index.html");
  await expect(page.locator("h1").first()).toBeVisible();
  const size = testInfo.project.name === "phone" ? "390" : "1440";
  await page.screenshot({ path: `docs/screenshots/wave-home-${size}.png`, fullPage: false });
  await page.locator(".bot-launcher").click();
  await expect(page.locator(".py-chat")).toBeVisible();
  await page.locator("#py-chat-input").fill("What is a queue?");
  await page.locator(".py-chat-form").locator("button[type=submit]").click();
  await expect(page.locator(".py-chat-log")).toContainText(/queue|I don't have that yet/i);
  await page.screenshot({ path: `docs/screenshots/wave-bot-${size}.png`, fullPage: false });
  await page.goto("/rooms/route-queue.html");
  await expect(page.locator("h1")).toContainText("Queues");
  await page.screenshot({ path: `docs/screenshots/wave-lesson-${size}.png`, fullPage: false });
});

test("short phone keeps the chat input on screen", async ({ page }) => {
  await quiet(page);
  await page.setViewportSize({ width: 390, height: 430 });
  await page.goto("/index.html");
  await page.locator(".bot-launcher").click();
  const input = page.locator("#py-chat-input");
  const send = page.locator(".py-chat-form button[type=submit]");
  await expect(input).toBeVisible();
  await expect(send).toBeVisible();
  const hit = await page.evaluate(() => {
    function exposed(selector) {
      const el = document.querySelector(selector);
      const rect = el.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return false;
      if (rect.top < 0 || rect.left < 0) return false;
      if (rect.bottom > window.innerHeight || rect.right > window.innerWidth) return false;
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return Boolean(top) && (top === el || el.contains(top));
    }
    return { input: exposed("#py-chat-input"), send: exposed(".py-chat-form button[type=submit]") };
  });
  expect(hit.input).toBe(true);
  expect(hit.send).toBe(true);
  await page.screenshot({ path: "docs/screenshots/wave-bot-390x430.png", fullPage: false });
});

test("routing desk is a labelled simulation", async ({ page }) => {
  await quiet(page);
  await page.goto("/sim.html");
  await expect(page.locator("h1")).toHaveText("Routing desk");
  await expect(page.locator("body")).toContainText("does not call Amazon Connect");
  await page.locator("#desk select[name=hours]").selectOption("closed");
  await page.locator("#desk button[type=submit]").click();
  await expect(page.locator("#desk-result")).toContainText("Simulation only");
  await expect(page.locator("#desk-result")).toContainText("closed");
});

test("offline shell, lesson, and chat", async ({ page, context }) => {
  await quiet(page);
  await page.goto("/index.html");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    await reg.update();
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("h1").first()).toBeVisible();
  await page.goto("/rooms/route-queue.html");
  await expect(page.locator("h1")).toContainText("Queues");
  await page.locator(".bot-launcher").click();
  await page.locator("#py-chat-input").fill("What is a queue?");
  await page.locator(".py-chat-form").locator("button[type=submit]").click();
  await expect(page.locator(".py-chat-log")).toContainText(/queue|I don't have that yet/i);
  await context.setOffline(false);
});
