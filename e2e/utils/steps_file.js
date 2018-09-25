'use strict';
const userFactory = require('../factories/userFactory.js');

module.exports = function () {
    return actor({
        amANewUser: () => userFactory.build()
    });
};
