const puppeteer = require('puppeteer');
const websites = require('./websites');
const tools = require('./tools');

const EREADER_USER_AGENT = 'Mozilla/5.0 (Linux like Android; fr_FR) AppleWebKit/534.34 PocketBook/626 (screen 758x1024; FW T626.5.6.155) Mobile';
const CHROME_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';

(async () => {
    const puppeteerOptions = {ignoreHTTPSErrors: true};
    if (process.env.CHROMIUM_PATH) {
        puppeteerOptions['executablePath'] = process.env.CHROMIUM_PATH;
    }

    const browser = await puppeteer.launch(puppeteerOptions);

    const page = await browser.newPage();
    page.setViewport({
        width: 1024,
        height: 1200,
        deviceScaleFactor: 1
    });
    await page.setCacheEnabled(false);
    await tools.ignoreGa(page);

    console.time('screenshots');
    await screenshot(page, websites);
    console.timeEnd('screenshots');

    await browser.close();
})();

async function screenshot(page, websites) {
    const website = websites.shift();
    if (!website) {
        return;
    }
    try {
        console.time(`${website.name} / ${website.type}`);

        if (website.type === 'ereader') {
          await page.setUserAgent(EREADER_USER_AGENT);
        } else {
          await page.setUserAgent(CHROME_USER_AGENT);
        }

        await page.goto(website.home, {waitUntil: 'load'});
        await page.screenshot({path: `${__dirname}/screenshots/${website.type}_${website.name}_home.png`});

        await page.goto(website.product, {waitUntil: 'load'});
        await page.screenshot({path: `${__dirname}/screenshots/${website.type}_${website.name}_product.png`});

        if (website.type === 'ereader') {
            await page.click('.buy');
            await page.waitForSelector('.cart-confirm-msg', {timeout: 60000});
            await page.click('.cart-confirm-msg a.main');
            await page.waitForSelector('#co_step_1');
        } else {
            await page.click('#button_add_to_cart');
            await page.waitForSelector('a.btn-primary[href="/checkout/cart"]', {timeout: 60000});
            await page.click('a.btn-primary[href="/checkout/cart"]');
            await page.waitForSelector('#shopping-breadcrumbs-1', {timeout: 60000});
        }

        await page.screenshot({path: `${__dirname}/screenshots/${website.type}_${website.name}_cart.png`});

        console.timeEnd(`${website.name} / ${website.type}`);
    } catch (error) {
        console.warn(website.url, error);
    }
    return screenshot(page, websites);
}
