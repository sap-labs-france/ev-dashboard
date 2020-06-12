const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

module.exports = {
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['en', 'fr', 'es', 'de']
    }),
    new MomentTimezoneDataPlugin({
      startYear: new Date().getFullYear() - 2,
      endYear: new Date().getFullYear() + 2,
    })
  ]
};
