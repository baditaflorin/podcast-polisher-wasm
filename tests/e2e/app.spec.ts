import { expect, test } from "@playwright/test";
import { resolve } from "node:path";

test("renders project links and build metadata", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: /polish a podcast/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /star on github/i })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/podcast-polisher-wasm"
  );
  await expect(page.getByRole("link", { name: /support via paypal/i })).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita"
  );
  await expect(page.getByText(/version/i)).toBeVisible();
  await expect(page.getByText(/commit/i)).toBeVisible();
});

test("processes demo audio through the browser pipeline", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("./");
  await page.getByRole("button", { name: /demo audio/i }).click();
  await expect(page.getByText("demo-podcast.wav")).toBeVisible();
  await expect(page.getByText(/first guess:/i)).toBeVisible();

  await page.getByRole("button", { name: /^process$/i }).click();

  await expect(page.getByText(/export ready/i)).toBeVisible({ timeout: 120_000 });
  await expect(page.getByRole("link", { name: /download demo-podcast-polished\.mp3/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^metadata$/i })).toBeVisible();
  await expect(page.locator("dd", { hasText: "RNNoise" })).toBeVisible();
});

test("blocks empty files before FFmpeg starts", async ({ page }) => {
  await page.goto("./");
  await page.locator('input[type="file"]').setInputFiles(resolve("test/fixtures/realdata/empty-mp3.mp3"));

  await expect(page.getByText(/this recording is empty/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^process$/i })).toBeDisabled();
});
