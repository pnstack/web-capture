import { Browser, chromium } from '@playwright/test';
import express, { NextFunction, Request, Response } from 'express';

import 'dotenv/config';

export type CaptureOptions = {
  width?: number;
  height?: number;
  selector?: string;
  fullPage?: boolean;
};

// Function to capture a screenshot using a shared browser instance
const capturePage = async (browser: Browser, url, options?: CaptureOptions) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const { width, height, selector } = options || {};

  try {
    page.setDefaultNavigationTimeout(30000);
    await page.setViewportSize({ width: width ?? 1920, height: height ?? 1080 });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.error('Go error', e);
    }

    page.on('domcontentloaded', () => {
      console.log('domcontentloaded');
    });
    page.on('load', () => {
      console.log('Page load');
    });

    if (selector) {
      await page.waitForSelector(selector);
      const buffer = await page.locator(selector).screenshot({});
      return buffer;
    }
    const buffer = await page.screenshot({
      fullPage: options.fullPage,
    });
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
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  app.locals.browser = browser;

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.type('text').send('ok');
  });

  // Main endpoint to capture and serve screenshots
  app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, format, width, height, selector, fullPage } = req.query as any;

      if (!url) {
        res.status(400).send({ error: 'Query parameter "url" is required.' });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (err) {
        res.status(400).send({ error: 'Provided url is invalid.' });
        return;
      }

      const buffer = await capturePage(browser, url, {
        width: width ? parseInt(width, 10) : 1920,
        height: height ? parseInt(height, 10) : 1080,
        selector,
        fullPage: fullPage === 'true',
      });

      if (!buffer) {
        res.status(500).send({ error: 'Failed to capture the screenshot.' });
        return;
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
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'attachment; filename=download.png');
          res.send(buffer);
          break;
      }
    } catch (error) {
      next(error);
    }
    return;
  });

  app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err);
    res.status(500).send({ error: 'Internal Server Error' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
