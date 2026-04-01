import puppeteer from 'puppeteer-core';
import { mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });
const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-')).length;
const chromePath = 'C:/Users/Kristiyan/.cache/puppeteer/chrome-headless-shell/win64-145.0.7632.77/chrome-headless-shell-win64/chrome-headless-shell.exe';
const browser = await puppeteer.launch({ executablePath: chromePath, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 8000));
// Click Start Story
await page.evaluate(() => {
  const btn = document.querySelector('.adventure-start-btn');
  if (btn) btn.click();
});
await new Promise(r => setTimeout(r, 2000));
const fp = join(dir, `screenshot-${existing+1}-mobile-story-card.png`);
await page.screenshot({ path: fp });
console.log('Screenshot saved: ' + fp);
await browser.close();
