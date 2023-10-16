MomentLocalesPlugin = require('moment-locales-webpack-plugin');
MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

module.exports = {
  plugins: [
    new MomentLocalesPlugin({
      // This seems to have no impact!
      localesToKeep: ['en', 'en-us', 'en-gb', 'en-au', 'fr', 'es', 'de', 'pt', 'it', 'cs'],
    }),
    new MomentTimezoneDataPlugin({
      startYear: new Date().getFullYear() - 2,
      endYear: new Date().getFullYear() + 2,
    }),
  ],
};
