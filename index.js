const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const NAV_TIMEOUT = 8000;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function getBrowser() {
  const puppeteer = require('puppeteer-core');

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
    const chromium = require('@sparticuz/chromium');
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');

  return puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

app.get('/', (req, res) => {
  res.json({ estado: 'Activo' });
});

app.get('/api/bypass', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Se requiere el parámetro url', estado: 'error' });
  }

  let browser = null;
  let page = null;

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);

    // Bloquea recursos innecesarios para reducir tiempo de carga
    await page.setRequestInterception(true);
    page.on('request', (intercepted) => {
      const type = intercepted.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
        intercepted.abort();
      } else {
        intercepted.continue();
      }
    });

    let timedOut = false;

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: NAV_TIMEOUT,
      });
    } catch (navErr) {
      // Si es timeout, marcamos la bandera pero continuamos para capturar
      // la URL en la que se quedó atascado el navegador
      if (navErr.name === 'TimeoutError' || navErr.message.includes('timeout')) {
        timedOut = true;
      } else {
        throw navErr;
      }
    }

    // Capturamos la URL actual incluso si hubo timeout parcial
    const finalUrl = page.url();

    // Intentamos extraer href de un botón/enlace de redirección en el DOM
    let redirectHref = null;
    try {
      redirectHref = await page.evaluate(() => {
        const selectors = [
          'a[href*="http"]',
          'a.btn',
          'a.button',
          'a[rel="nofollow"]',
          'a[target="_blank"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.href && !el.href.startsWith(window.location.origin)) {
            return el.href;
          }
        }
        return null;
      });
    } catch (_) {
      // Si el evaluate falla tras timeout parcial, continuamos sin él
    }

    if (timedOut) {
      return res.status(200).json({
        original_url: url,
        final_url: finalUrl,
        bypassed_url: redirectHref || finalUrl,
        estado: 'timeout',
        aviso: 'La página no completó la carga en 8s, pero se capturó la URL alcanzada.',
      });
    }

    return res.json({
      original_url: url,
      final_url: finalUrl,
      bypassed_url: redirectHref || finalUrl,
      estado: 'success',
    });

  } catch (err) {
    // Capturamos la URL del navegador si aún existe la página
    let stuckUrl = null;
    try {
      if (page) stuckUrl = page.url();
    } catch (_) {}

    return res.status(500).json({
      original_url: url,
      stuck_url: stuckUrl,
      error: err.message,
      estado: 'error',
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
