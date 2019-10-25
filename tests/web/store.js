const expect = require('chai').expect;
const puppeteer = require('puppeteer');
const tools = require(`${__dirname}/tools`);

const config = require(`${__dirname}/../../config/stores/web.json`).store;

const DEFAULT_TIMEOUT = 10000; // ms
const DEBUG = false;

describe('Web store', function () {
  this.timeout(DEFAULT_TIMEOUT);

  let page, browser;

  before(async function () {
    browser = await puppeteer.launch({ headless: !DEBUG });
    page = await browser.newPage();
    await tools.ignoreGa(page);
    await page.goto(config.url, { waitUntil: 'networkidle0' });
  });

  after(async function () {
    await browser.close();
  });

  describe('Homepage', () => {
    it('should have a welcome text', async () => {
      const text = await page.content();
      expect(text.search('Bienvenue sur la librairie')).to.be.at.least(0);
    });

    it('should have at least 8 covers', async () => {
      const coversCount = await page.evaluate(() => {
        const coverElements = Array.from(document.querySelectorAll('.product-img img'));
        return coverElements.length;
      });
      expect(coversCount).to.be.at.least(8);
    });

    it('should have a thesaurus', async () => {
      const thesaurusCount = await page.evaluate(() => {
        const thesaurusElements = Array.from(document.querySelectorAll('.sidebar li'));
        return thesaurusElements.length;
      });
      expect(thesaurusCount).to.be.at.least(40);
    });

  });


  describe('Login', function () {
    it('should have a cart element', () => {
      return page.waitForSelector('.mon_panier')
        .then(async () => {
          const text = await page.content();
          expect(text.search('Vous connecter') !== -1).to.be.true;
        })
        .catch(error => {
          console.error(error);
          throw new Error('Cart has not been found');
        });
    });

    it('should log in', async () => {
      await page.click('a[title="Vous connecter"]');
      await page.waitForSelector('#login-form');

      await page.type('input[name="login[username]"]', config.login);
      await page.type('input[name="login[password]"]', config.password);

      const loginForm = await page.$("#login-form");
      await page.evaluate(loginForm => loginForm.submit(), loginForm);

      return page.waitForSelector('.block-account')
        .then(async () => {
          const text = await page.content();
          expect(text.search('Vos informations personnelles') !== -1).to.be.true;
        })
        .catch(error => {
          console.error(error);
          throw new Error('User personal space has not been found');
        });
     });
  });

  describe('Cart', function () {
    it ('should have a clean cart', async () => {
      await page.waitForSelector('#top-cart a');

      const cartLabel = await page.evaluate(() => document.querySelector('#top-cart a').innerHTML);
      const itemCount = /(\d)+/i.exec(cartLabel)[0];

      await page.click('#top-cart a');

      if (itemCount > 0) {
        await page.waitForSelector('.tab_cart');

        for (let i = 0; i < itemCount; i++) {
          //await page.screenshot({ path: `cart-${i}.png`, fullPage: true });
          await page.click('.td_del a');
          await page.waitForNavigation();
        }
      }

      await page.waitForSelector('.title_tunnel_step');

      const text = await page.content();
      expect(text.search('Votre panier est vide') !== -1).to.be.true;
    });
  });
});