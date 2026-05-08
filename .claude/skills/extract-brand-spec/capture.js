// capture.js — Playwright capture script for extract-landing-source-spec
// Usage: PW=<playwright-path> node capture.js <TARGET_URL> <PAGE_PREFIX>
//
// Captures per page:
//   1. PAGE_PREFIX-full.png      — full-page screenshot
//   2. PAGE_PREFIX-hero.png      — hero viewport (1440px)
//   3. PAGE_PREFIX-section1.png  — first H2 section (trust/logos/first feature)
//   4. PAGE_PREFIX-mobile.png    — full-page mobile (375px)
//
// For the primary page (prefix === "homepage"), also writes docs/computed-styles.json.

const { chromium } = require('playwright');
const fs = require('fs');
fs.mkdirSync('docs/screenshots', { recursive: true });
fs.mkdirSync('docs/assets', { recursive: true });
fs.mkdirSync('docs/assets/images', { recursive: true });
fs.mkdirSync('docs/assets/backgrounds', { recursive: true });
fs.mkdirSync('docs/assets/logos', { recursive: true });

(async () => {
  const url = process.argv[2];
  const prefix = process.argv[3] || 'homepage';
  const isPrimary = prefix === 'homepage';

  if (!url) {
    console.error('Usage: PW=<playwright-path> node capture.js <URL> <prefix>');
    process.exit(1);
  }

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2500);

  // 1. Full page
  await page.screenshot({ path: `docs/screenshots/${prefix}-full.png`, fullPage: true });
  console.log('OK full');

  // 2. Hero viewport
  await page.screenshot({ path: `docs/screenshots/${prefix}-hero.png` });
  console.log('OK hero');

  // 3. First H2 section (trust / logos / first feature section)
  try {
    const firstH2 = await page.$('h2');
    if (firstH2) {
      let el = firstH2;
      let found = null;
      for (let j = 0; j < 7; j++) {
        el = await el.evaluateHandle(e => e.parentElement);
        if (!el) break;
        const h = await el.evaluate(e => e ? e.offsetHeight : 0);
        if (h > 100) { found = el; break; }
      }
      if (found) {
        await found.asElement().scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await found.asElement().screenshot({ path: `docs/screenshots/${prefix}-section1.png` });
        console.log('OK section1');
      }
    }
  } catch (e) { console.log('SKIP section1: ' + e.message); }

  // 4. Mobile full page
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/screenshots/${prefix}-mobile.png`, fullPage: true });
  console.log('OK mobile');

  // 5. Computed CSS extraction (primary page only)
  if (isPrimary) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const cssKeys = [
      'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
      'color', 'fontSize', 'fontWeight', 'lineHeight',
      'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
      'gap', 'gridTemplateColumns', 'borderRadius', 'border', 'boxShadow',
      'display', 'maxWidth', 'height', 'fontFamily', 'position'
    ];

    const computed = await page.evaluate((keys) => {
      const g = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = {};
        keys.forEach(k => { r[k] = cs[k]; });
        r._tag = el.tagName;
        r._class = el.className.toString().slice(0, 80);
        r._text = el.textContent.trim().slice(0, 60);
        return r;
      };

      const result = { sectionBackgrounds: [], buttons: [] };
      const navEl = document.querySelector('nav, header');
      result.nav = g(navEl);
      if (navEl) {
        const rect = navEl.getBoundingClientRect();
        result.navHeightPx = Math.round(rect.height);
        result.navBackgroundHex = getComputedStyle(navEl).backgroundColor;
      }
      result.h1 = g(document.querySelector('h1'));
      result.body = g(document.body);
      result.footer = g(document.querySelector('footer'));

      // Hero detection — walk UP from h1/first-section to find actual background
      const heroCandidate = document.querySelector('h1') || document.querySelector('section, main > *');
      if (heroCandidate) {
        let el = heroCandidate;
        let heroBgColor = 'rgba(0, 0, 0, 0)';
        let heroBgImage = 'none';
        for (let j = 0; j < 10; j++) {
          if (!el || el === document.body) break;
          const cs = getComputedStyle(el);
          const bg = cs.backgroundColor;
          const bgImg = cs.backgroundImage;
          const hasSolidBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
          const hasBgImage = bgImg && bgImg !== 'none';
          if (hasSolidBg || hasBgImage) {
            heroBgColor = bg;
            heroBgImage = bgImg !== 'none' ? bgImg.slice(0, 200) : 'none';
            break;
          }
          el = el.parentElement;
        }
        result.navVsHeroMismatch = result.navBackgroundHex !== heroBgColor;
        result.heroBgConfirmed = heroBgColor;
        result.heroBgImage = heroBgImage;
      }

      // Section backgrounds — h1+h2, capped at 12, captures bg color AND bg image
      document.querySelectorAll('h1,h2').forEach((h, i) => {
        if (i >= 12) return;
        let el = h;
        for (let j = 0; j < 8; j++) {
          el = el.parentElement;
          if (!el || el === document.body) break;
          const cs = getComputedStyle(el);
          const bg = cs.backgroundColor;
          const bgImg = cs.backgroundImage;
          const hasSolidBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
          const hasBgImage = bgImg && bgImg !== 'none';
          if (hasSolidBg || hasBgImage) {
            // Extract URL from backgroundImage if present
            const bgImgUrl = hasBgImage ? (bgImg.match(/url\(["']?([^"')]+)["']?\)/) || [])[1] || bgImg.slice(0, 200) : null;
            result.sectionBackgrounds.push({
              index: i,
              tag: h.tagName,
              heading: h.textContent.trim().slice(0, 60),
              backgroundColor: bg,
              backgroundImage: bgImgUrl,
              backgroundSize: hasBgImage ? cs.backgroundSize : null,
              backgroundPosition: hasBgImage ? cs.backgroundPosition : null,
              paddingTop: cs.paddingTop,
              paddingBottom: cs.paddingBottom
            });
            break;
          }
        }
      });

      // Full-page background scan — all block-level elements with non-transparent bg
      result.allSectionBands = [];
      const candidates = document.querySelectorAll(
        'section, [class*="section"], [class*="banner"], [class*="hero"], [class*="block"], header, main > div, body > div'
      );
      const seen = new Set();
      candidates.forEach(el => {
        if (result.allSectionBands.length >= 20) return;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        const bgImg = cs.backgroundImage;
        const hasSolidBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
        const hasBgImage = bgImg && bgImg !== 'none';
        if ((!hasSolidBg && !hasBgImage) || el.offsetHeight < 60) return;
        const key = bg + '|' + (hasBgImage ? bgImg.slice(0, 80) : '');
        if (seen.has(key)) return;
        seen.add(key);
        const bgImgUrl = hasBgImage ? (bgImg.match(/url\(["']?([^"')]+)["']?\)/) || [])[1] || bgImg.slice(0, 200) : null;
        const label = (el.querySelector('h1,h2,h3') || el).textContent.trim().slice(0, 50);
        result.allSectionBands.push({
          tag: el.tagName,
          className: el.className.toString().slice(0, 60),
          label,
          backgroundColor: bg,
          backgroundImage: bgImgUrl,
          backgroundSize: hasBgImage ? cs.backgroundSize : null,
          height: Math.round(el.offsetHeight),
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom
        });
      });

      // CSS variables from :root
      result.cssVariables = {};
      try {
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule.selectorText === ':root' && rule.style) {
                for (const prop of rule.style) {
                  if (prop.startsWith('--')) {
                    result.cssVariables[prop] = rule.style.getPropertyValue(prop).trim().slice(0, 100);
                  }
                }
              }
            }
          } catch (e) { /* cross-origin sheet */ }
        }
      } catch (e) { /* skip */ }

      // Buttons — capped at 10
      document.querySelectorAll('a, button').forEach(btn => {
        if (result.buttons.length >= 10) return;
        const cs = getComputedStyle(btn);
        const bg = cs.backgroundColor;
        const text = btn.textContent.trim();
        if (text && text.length > 2 && text.length < 60 && bg !== 'rgba(0, 0, 0, 0)') {
          result.buttons.push({
            text: text.slice(0, 50),
            backgroundColor: bg,
            color: cs.color,
            borderRadius: cs.borderRadius,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            padding: cs.padding,
            border: cs.border
          });
        }
      });

      // Section layouts — capped at 10
      result.sectionLayouts = [];
      document.querySelectorAll('h1,h2').forEach((h, i) => {
        if (i >= 10) return;
        let el = h;
        for (let j = 0; j < 7; j++) {
          el = el.parentElement;
          if (!el) break;
          if (el.offsetHeight > 100) {
            const cs = getComputedStyle(el);
            const display = cs.display;
            let inner = el.querySelector(
              '[style*="grid"], [style*="flex"], [class*="grid"], [class*="flex"], [class*="row"], [class*="columns"]'
            );
            if (!inner) {
              for (const child of el.children) {
                if (child.children.length >= 2) { inner = child; break; }
              }
            }
            const innerCs = inner ? getComputedStyle(inner) : null;
            result.sectionLayouts.push({
              headingIndex: i,
              heading: h.textContent.trim().slice(0, 50),
              containerDisplay: display,
              containerGrid: cs.gridTemplateColumns,
              innerDisplay: innerCs ? innerCs.display : null,
              innerGrid: innerCs ? innerCs.gridTemplateColumns : null,
              innerGap: innerCs ? innerCs.gap : null,
              innerFlex: innerCs ? innerCs.flexDirection : null,
              childCount: inner ? inner.children.length : null
            });
            break;
          }
        }
      });

      // Image metrics — capped at 20, full src preserved for download
      // Also captures lazy-loaded (data-src) and <picture> sources
      result.imageMetrics = [];
      const seenImgSrcs = new Set();
      const addImage = (src, alt, el) => {
        if (result.imageMetrics.length >= 20) return;
        if (!src || src.startsWith('data:') || src.includes('pixel') || src.includes('gravatar')) return;
        if (seenImgSrcs.has(src)) return;
        seenImgSrcs.add(src);
        const nw = el.naturalWidth || 0;
        const nh = el.naturalHeight || 0;
        if (nw < 50 && el.tagName === 'IMG') return;
        const rect = el.getBoundingClientRect();
        result.imageMetrics.push({
          src: src.slice(0, 300),
          alt: (alt || '').slice(0, 80),
          naturalWidth: nw,
          naturalHeight: nh,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          aspectRatio: nw && nh ? (nw / nh).toFixed(3) : null,
          isLogo: nw < 400 && nh < 200,
          isHero: Math.round(rect.width) > 600,
        });
      };
      // Standard <img> tags — including lazy-loaded (data-src / data-lazy-src)
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || '';
        addImage(src, img.alt, img);
      });
      // <picture> sources — captures srcset first URL
      document.querySelectorAll('picture source').forEach(src => {
        if (result.imageMetrics.length >= 20) return;
        const srcset = src.getAttribute('srcset') || '';
        const firstUrl = srcset.split(',')[0].trim().split(' ')[0];
        if (firstUrl && firstUrl.startsWith('http')) {
          const parentImg = src.closest('picture')?.querySelector('img');
          addImage(firstUrl, parentImg ? parentImg.alt : '', src);
        }
      });

      // Background images from CSS (for sections that use background-image instead of <img>)
      result.cssBackgroundImages = [];
      document.querySelectorAll('section, [class*="hero"], [class*="banner"], [class*="cta"], header, main > div').forEach(el => {
        if (result.cssBackgroundImages.length >= 10) return;
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
          if (match && match[1] && !match[1].startsWith('data:')) {
            result.cssBackgroundImages.push({
              url: match[1].slice(0, 300),
              element: el.tagName,
              className: el.className.toString().slice(0, 60),
              label: (el.querySelector('h1,h2,h3') || el).textContent.trim().slice(0, 50),
            });
          }
        }
      });

      return result;
    }, cssKeys);

    // Font detection
    computed.fonts = await page.evaluate(() => {
      const result = { googleFonts: [], fontFaces: [], linkTags: [] };
      document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]').forEach(link => {
        const href = link.href || '';
        if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
          result.googleFonts.push(href.slice(0, 200));
        }
      });
      document.querySelectorAll('style').forEach(style => {
        const text = style.textContent || '';
        const matches = text.match(/@font-face\s*\{[^}]+\}/g) || [];
        matches.forEach(m => {
          const family = (m.match(/font-family:\s*['"]?([^;'"]+)/) || [])[1];
          const src = (m.match(/src:[^;]+/) || [])[0];
          if (family) result.fontFaces.push({ family: family.trim(), src: (src || '').slice(0, 100) });
        });
      });
      document.querySelectorAll('head link').forEach(link => {
        const href = link.href || '';
        if (href.includes('font') || href.includes('typekit') || href.includes('cloud.typography')) {
          result.linkTags.push(href.slice(0, 200));
        }
      });
      return result;
    });

    fs.writeFileSync('docs/computed-styles.json', JSON.stringify(computed, null, 2));
    console.log('OK computed-styles.json saved');

    // Asset download — logos, backgrounds, and prominent images
    const https = require('https');
    const http = require('http');
    const path = require('path');

    const downloadAsset = (srcUrl, destPath) => new Promise((resolve) => {
      try {
        const parsed = new URL(srcUrl);
        const proto = parsed.protocol === 'https:' ? https : http;
        const file = fs.createWriteStream(destPath);
        proto.get(srcUrl, { timeout: 10000 }, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
          } else {
            file.close(); fs.unlink(destPath, () => {}); resolve(false);
          }
        }).on('error', () => { fs.unlink(destPath, () => {}); resolve(false); });
      } catch (e) { resolve(false); }
    });

    const safeFilename = (url) => {
      try {
        const p = new URL(url).pathname;
        return path.basename(p).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'asset';
      } catch { return 'asset'; }
    };

    fs.mkdirSync('docs/assets/images', { recursive: true });
    fs.mkdirSync('docs/assets/logos', { recursive: true });
    fs.mkdirSync('docs/assets/backgrounds', { recursive: true });

    for (const img of (computed.imageMetrics || [])) {
      if (!img.src || !img.src.startsWith('http')) continue;
      const fname = safeFilename(img.src);
      if (img.isLogo) {
        const dest = `docs/assets/logos/${fname}`;
        const ok = await downloadAsset(img.src, dest);
        console.log(`${ok ? 'DL' : 'SKIP'} logo: ${fname}`);
      } else if (img.isHero || img.renderedWidth > 400) {
        const dest = `docs/assets/images/${fname}`;
        const ok = await downloadAsset(img.src, dest);
        console.log(`${ok ? 'DL' : 'SKIP'} image: ${fname}`);
      }
    }

    for (const bg of (computed.cssBackgroundImages || [])) {
      if (!bg.url || !bg.url.startsWith('http')) continue;
      const fname = safeFilename(bg.url);
      const dest = `docs/assets/backgrounds/${fname}`;
      const ok = await downloadAsset(bg.url, dest);
      console.log(`${ok ? 'DL' : 'SKIP'} background: ${fname}`);
    }

    console.log('OK assets downloaded');
  }

  await browser.close();
  console.log('DONE: ' + prefix);
})().catch(e => {
  console.error('CAPTURE FAILED: ' + e.message);
  process.exit(1);
});
