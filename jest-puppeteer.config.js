module.exports = {
  launch: {
    dumpio: false,
    headless: true,
    product: 'chrome',
    /* slowMo: 30, */
    devtools: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
    ],
  },
};
