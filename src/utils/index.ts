import { Browser, chromium } from '@playwright/test';

import 'dotenv/config';

function uuidv4() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now();
  }
  const chars = '0123456789abcdef';
  let uuid = '';

  // Tạo 16 byte ngẫu nhiên
  const bytes = [];
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor((1 + Math.random()) * 0x10000) & 0xff;
  }

  // Đảm bảo phiên bản UUID 4 (bit 4-5 của byte 6 = 0100)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  // Đảm bảo nhóm bit (bit 6-7 của byte 8 = 10xx)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Định dạng UUID
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      uuid += '-';
    }
    uuid += chars[(bytes[i] >> 4) & 0xf];
    uuid += chars[bytes[i] & 0xf];
  }

  return uuid;
}

export async function createLambdaTestBrowser() {
  const capabilities = {
    browserName: 'Chrome', // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    browserVersion: 'latest',
    'LT:Options': {
      platform: 'Windows 10',
      build: 'dev',
      name: `${uuidv4()} - web-capture`,
      user: process.env.WS_USER,
      accessKey: process.env.WS_PASSWORD,
      network: true,
      video: true,
      console: true,
    },
  };
  const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
    JSON.stringify(capabilities)
  )}`;
  console.log('use lambdatest ws endpoint:', wsEndpoint);
  return await chromium.connect(wsEndpoint);
}

export async function createBrowserStackBrowser() {
  const caps = {
    os: 'Windows', // 'os x',
    os_version: '11', //'big sur',
    browser: 'chrome', // You can choose `chrome`, `edge` or `firefox` in this capability
    browser_version: 'latest', // We support v83 and above. You can choose `latest`, `latest-beta`, `latest-1`, `latest-2` and so on, in this capability
    'browserstack.username': process.env.WS_USER,
    'browserstack.accessKey': process.env.WS_PASSWORD,
    // 'browserstack.geoLocation': 'FR',
    project: `web-capture`,
    build: `playwright-build-$${uuidv4()}`,
    name: 'Capture Test', // The name of your test and build. See browserstack.com/docs/automate/playwright/organize tests for more details
    buildTag: 'reg',
    resolution: '1920x1080',
    // 'browserstack.local': 'true',
    // 'browserstack.localIdentifier': 'local_connection_name',
    // 'browserstack.playwrightVersion': '1.latest',
    // 'client.playwrightVersion': '1.latest',
    // 'browserstack.debug': 'true', // enabling visual logs
    // 'browserstack.console': 'info', // Enabling Console logs for the test
    // 'browserstack.networkLogs': 'true', // Enabling network logs for the test
    // 'browserstack.interactiveDebugging': 'true',
  };

  const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
    JSON.stringify(caps)
  )}`;
  console.log('use browserstack ws endpoint:', wsEndpoint);
  return await chromium.connect(wsEndpoint);
}

export async function getBrowser() {
  switch (process.env.BROWSER_PROVIDER) {
    case 'lambdatest':
      return await createLambdaTestBrowser();
    case 'browserstack':
      return await createBrowserStackBrowser();
    default:
      console.log('launch local browser');
      return await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  }
}
