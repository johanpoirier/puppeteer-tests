module.exports = {
  async ignoreGa(page) {
      await page.setRequestInterception(true);
      page.on('request', interceptedRequest => {
          if (interceptedRequest.url().indexOf('www.google-analytics.com') > 0) {
              interceptedRequest.abort();
          }
          else {
              interceptedRequest.continue();
          }
      });
  }
};