import { chromium } from '@playwright/test';
import express from 'express';

import 'dotenv/config';

// Function to capture a screenshot using a shared browser instance
const capturePage = async (browser, url) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    page.setDefaultNavigationTimeout(30000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const buffer = await page.screenshot();
    return buffer;
  } finally {
    await page.close();
    await context.close();
  }
};

const app = express();
const port = process.env.PORT || 5510;

// Launch browser once when the server starts
(async () => {
  const browser = await chromium.launch({ headless: false });
  app.locals.browser = browser;

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.type('text').send('ok');
  });

  // Main endpoint to capture and serve screenshots
  app.get('/', async (req, res, next) => {
    try {
      const { url, format } = req.query;

      if (!url) {
        return res.status(400).send({ error: 'Query parameter "url" is required.' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (err) {
        return res.status(400).send({ error: 'Provided url is invalid.' });
      }

      const buffer = await capturePage(browser, url);

      if (!buffer) {
        return res.status(500).send({ error: 'Failed to capture the screenshot.' });
      }

      const base64Image = 'data:image/png;base64,' + buffer.toString('base64');
      switch (format) {
        case 'base64':
          res.send(base64Image);
          break;
        case 'json':
          res.json({ image: base64Image });
          break;
        default:
          // stream image to client as an attachment
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'attachment; filename=download.png');
          res.send(buffer);
          break;
      }
    } catch (error) {
      next(error);
    }
  });

  app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err);
    res.status(500).send({ error: 'Internal Server Error' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
