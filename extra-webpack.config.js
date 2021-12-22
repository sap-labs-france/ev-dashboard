MomentLocalesPlugin = require('moment-locales-webpack-plugin');
MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

module.exports = {
  plugins: [
    new MomentLocalesPlugin({
      // This has no impact!
      // TODO - how to consider en_AU specific use-case?
      // TODO - cs_CZ is missing!
      localesToKeep: ['en', 'fr', 'es', 'de', 'pt', 'it']
    }),
    new MomentTimezoneDataPlugin({
      startYear: new Date().getFullYear() - 2,
      endYear: new Date().getFullYear() + 2,
    })
  ]
};
