const Factory = require('rosie').Factory;
const faker = require('faker');

module.exports = new Factory()
  .attr('firstName', () => faker.name.firstName())
  .attr('lastName', () => faker.name.lastName())
  .attr('email', () => faker.internet.email())
  .attr('password', () => faker.internet.password() + "@1Aa");
