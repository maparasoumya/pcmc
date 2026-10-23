import { test, expect } from "@playwright/test";
const admin = process.env.PCMC_ADMIN_URL || "http://127.0.0.1:5174";
test("a 6 MB file is uploaded to storage without passing through the Django function", async ({
  page,
}) => {
  const calls = [];
  await page.addInitScript(() =>
    sessionStorage.setItem("pcmc_token", "test-staff-token"),
  );
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    calls.push({ path: url.pathname, body: req.postData() });
    let body = [];
    if (url.pathname.endsWith("/auth/me/")) body = { id: 1, is_staff: true };
    if (url.pathname.endsWith("/uploads/intent/"))
      body = {
        mode: "direct",
        url: "https://upload.example.test/object",
        headers: { "Content-Type": "image/png" },
        intent: "signed-test-intent",
      };
    if (url.pathname.endsWith("/uploads/complete/"))
      body = { id: 1, file: "https://media.example.test/meeting.png" };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  let uploaded = 0,
    leakedToken = false;
  await page.route("https://upload.example.test/object", async (route) => {
    uploaded = route.request().postDataBuffer()?.length || 0;
    leakedToken = !!route.request().headers().authorization;
    await route.fulfill({
      status: 200,
      headers: { "Access-Control-Allow-Origin": new URL(admin).origin },
    });
  });
  await page.goto(admin + "/resources");
  const buffer = Buffer.alloc(6 * 1024 * 1024);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer);
  await page
    .getByLabel("Upload document or image", { exact: true })
    .setInputFiles({ name: "meeting.png", mimeType: "image/png", buffer });
  await expect(
    page.getByLabel("Document URL", { exact: true }),
  ).toHaveValue("https://media.example.test/meeting.png");
  expect(uploaded).toBe(buffer.length);
  expect(leakedToken).toBe(false);
  expect(calls.some((c) => c.path.endsWith("/assets/"))).toBe(false);
  const intent = calls.find((c) => c.path.endsWith("/uploads/intent/"));
  expect(JSON.parse(intent.body).size).toBe(buffer.length);
  expect(intent.body.length).toBeLessThan(250);
  expect(calls.some((c) => c.path.endsWith("/uploads/complete/"))).toBe(true);
});
