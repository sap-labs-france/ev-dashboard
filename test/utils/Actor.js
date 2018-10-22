'use strict';
const userFactory = require('../factories/UserFactory.js');

module.exports = function () {
    return actor({
        amANewUser: () => userFactory.build()
    });
};
