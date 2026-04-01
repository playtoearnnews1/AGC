import puppeteer from 'puppeteer-core';
import { mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'mobile';
const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });
const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-')).length;
const num = existing + 1;
const filename = `screenshot-${num}-${label}.png`;
const filepath = join(dir, filename);
const chromePath = 'C:/Users/Kristiyan/.cache/puppeteer/chrome-headless-shell/win64-145.0.7632.77/chrome-headless-shell-win64/chrome-headless-shell.exe';

const browser = await puppeteer.launch({ executablePath: chromePath, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 8000));

const fullPage = process.argv.includes('--full');
if (fullPage) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  });
}

await page.screenshot({ path: filepath, fullPage });
console.log('Screenshot saved: ' + filepath);
await browser.close();
