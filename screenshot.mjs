import { chromium } from 'playwright';

const token = process.argv[2] || 'ia57oqua';
const url = `http://localhost:5173/rsvp/${token}`;
const out = process.argv[3] || '/Users/paul.nonat/Desktop/danya-invitation.jpg';

const browser = await chromium.launch();
const page = await browser.newPage();

// High-res viewport (iPhone-style tall, like a printed card)
await page.setViewportSize({ width: 480, height: 900 });

await page.goto(url, { waitUntil: 'networkidle' });

// Skip the envelope — force the opened state
await page.evaluate(() => {
  // Inject a style to hide envelope and show content
  document.querySelectorAll('.env-screen').forEach(el => el.remove());
});

// Trigger envelope open by dispatching a scroll event
await page.evaluate(() => {
  window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
});

// Wait for envelope animation to finish
await page.waitForTimeout(1200);

// Wait for images to load
await page.waitForTimeout(1000);

// Get the full page height
const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);

await page.setViewportSize({ width: 480, height: fullHeight });
await page.waitForTimeout(500);

await page.screenshot({
  path: out,
  fullPage: true,
  type: 'jpeg',
  quality: 95,
});

await browser.close();
console.log(`Saved to ${out}`);
