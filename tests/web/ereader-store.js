const expect = require('chai').expect;
const puppeteer = require('puppeteer');

const config = require(`${__dirname}/../../config/stores/web.json`).ereader;

const DEFAULT_TIMEOUT = 10000; // ms
const DEBUG = false;

describe('Ereader store', function () {
  this.timeout(DEFAULT_TIMEOUT);

  let page, browser;

  before(async function () {
    browser = await puppeteer.launch({ headless: !DEBUG });
    page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Linux like Android; fr_FR) AppleWebKit/534.34 PocketBook/626 (screen 758x1024; FW T626.5.6.155) Mobile');

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      if (interceptedRequest.url().indexOf('www.google-analytics.com') > 0) {
        interceptedRequest.abort();
      }
      else {
        interceptedRequest.continue();
      }
    });

    await page.goto(config.url, { waitUntil: 'networkidle0' });
  });

  after(async function () {
    await browser.close();
  });

  describe('Homepage', () => {
    it('should have the reseller’s logo', async () => {
      const logo = await page.$('.brand img');
      const logoUrl = await logo.getProperty('src');
      const logoUrlValue = await logoUrl.jsonValue();
      expect(logoUrlValue.indexOf('logo')).to.be.greaterThan(0);
    });
  });

  describe('Categories', () => {
    it('should display the root category', async () => {
      await page.click('#menu a.cell');
      await page.waitForSelector('#home-button');
    });

    it('should have 12 sub-categories', async () => {
      const categoryCount = await page.evaluate(() => {
        const coverElements = Array.from(document.querySelectorAll('.block.cell'));
        return coverElements.length;
      });
      expect(categoryCount).to.equal(12);
    });
  });

});