'use strict';
const userFactory = require('../factories/UserFactory.js');

module.exports = function () {
  return actor({
    amANewUser: () => {
      return userFactory.build()
    },
    amASuperAdminUser: () => {
      return {
        'email': 'demo.super.admin@sap.com',
        'password': 'DeM*Us$r42'
      }
    },
    amAnAdminUser: () => {
      return {
        'email': 'demo.admin@sap.com',
        'password': 'DeM*Us$r42'
      }
    },
    amABasicUser: () => {
      return {
        'email': 'demo.basic@sap.com',
        'password': 'DeM*Us$r3'
      }
    },
    amADemoUser: () => {
      return {
        'email': 'demo.demo@sap.com',
        'password': 'DeM*Us$r1'
      }
    }
  });
};
