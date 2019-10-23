const puppeteer = require('puppeteer');
const websites = require('./websites');

const EREADER_USER_AGENT = 'Mozilla/5.0 (Linux like Android; fr_FR) AppleWebKit/534.34 PocketBook/626 (screen 758x1024; FW T626.5.6.155) Mobile';
const CHROME_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.setViewport({
        width: 1024,
        height: 1024,
        deviceScaleFactor: 1
    });
    await screenshot(page, websites);

    await browser.close();
})();

async function screenshot(page, websites) {
    const website = websites.pop();
    if (!website) {
        return;
    }
    try {
        if (website.type === 'ereader') {
          await page.setUserAgent(EREADER_USER_AGENT);
        } else {
          await page.setUserAgent(CHROME_USER_AGENT);
        }
        await page.goto(website.url, {waitUntil: 'networkidle0'});
        await page.screenshot({path: `screenshots/${website.type}_${website.name}.png`});
    } catch (error) {
        console.warn(website.url, error);
    }
    return screenshot(page, websites);
}
