const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ebook.chapitre.com', { waitUntil: 'networkidle' });
  const nbCovers = await page.evaluate(() => {
    const coverElements = Array.from(document.querySelectorAll('.product-img img'));
    return coverElements.length;
  });

  console.log(nbCovers);

  await browser.close();
})();
