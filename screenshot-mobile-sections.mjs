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

// Wait for preloader to finish
await new Promise(r => setTimeout(r, 9000));

const sections = [
  { name: 'hero', scroll: 0 },
  { name: 'story-intro', scroll: 'story-intro' },
  { name: 'story-card1', scroll: 'story-card1' },
  { name: 'evidence', scroll: 'evidence' },
  { name: 'fortune', scroll: 'fortune' },
  { name: 'footer', scroll: 'footer' },
];

async function capture(name, scrollTarget) {
  if (typeof scrollTarget === 'number') {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
  } else if (scrollTarget === 'story-intro') {
    await page.evaluate(() => {
      const el = document.getElementById('story');
      if (el) el.scrollIntoView({ block: 'start' });
    });
  } else if (scrollTarget === 'story-card1') {
    await page.evaluate(() => {
      const btn = document.querySelector('.adventure-start-btn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  } else if (scrollTarget === 'evidence') {
    await page.evaluate(() => {
      const el = document.getElementById('evidence-log');
      if (el) el.scrollIntoView({ block: 'start' });
    });
  } else if (scrollTarget === 'fortune') {
    await page.evaluate(() => {
      const el = document.getElementById('fortune-section');
      if (el) el.scrollIntoView({ block: 'start' });
    });
  } else if (scrollTarget === 'footer') {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
  await new Promise(r => setTimeout(r, 1500));
  const num = existing + sections.findIndex(s => s.name === name) + 1;
  const fp = join(dir, `screenshot-${num}-mobile-${name}.png`);
  await page.screenshot({ path: fp });
  console.log(`Saved: ${fp}`);
}

for (const s of sections) {
  await capture(s.name, s.scroll);
}

await browser.close();
