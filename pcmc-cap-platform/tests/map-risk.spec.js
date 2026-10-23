import { test, expect } from "@playwright/test";
const base = process.env.PCMC_PORTAL_URL || "http://127.0.0.1:5173";
test("risk controls keep the map visible without area-list panels", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.goto(`${base}/climate-map`);
  await page.getByLabel("Flood Risk Areas", { exact: true }).check();
  await page.getByLabel("Heat Risk Areas", { exact: true }).check();
  await expect(page.locator(".flood-risk-panel")).toHaveCount(0);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page).toHaveURL(`${base}/climate-map`);
  await page.getByLabel("Flood Risk Areas", { exact: true }).uncheck();
  await page.getByLabel("Heat Risk Areas", { exact: true }).uncheck();
  expect(errors).toEqual([]);
});

test("published risk coordinates still create map markers", async ({
  page,
}) => {
  const features = [
    {
      id: 100,
      title: "Verified flood point",
      data: { layer: "floodRisk", latitude: 18.63, longitude: 73.8 },
    },
    {
      id: 101,
      title: "Verified heat point",
      data: { layer: "heatRisk", latitude: 18.65, longitude: 73.82 },
    },
  ];
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        url.searchParams.get("kind") === "map" ? features : [],
      ),
    });
  });
  await page.goto(`${base}/climate-map`);
  await page.getByLabel("Flood Risk Areas", { exact: true }).check();
  await expect(page.locator('img[alt="Verified flood point"]')).toBeVisible();
  await page.getByLabel("Heat Risk Areas", { exact: true }).check();
  await expect(page.locator('img[alt="Verified heat point"]')).toBeVisible();
  await page.getByLabel("Flood Risk Areas", { exact: true }).uncheck();
  await expect(page.locator('img[alt="Verified flood point"]')).toHaveCount(0);
});
