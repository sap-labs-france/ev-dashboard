Feature('As a new registered user, I should validate my account before login @login');

const assert = require('assert');
let user;

BeforeSuite((I) => {
  user = I.amANewUser();
});

Scenario('I create my account', async (I, loginPage, authLayoutPage, registerPage) => {
  I.amOnPage(loginPage.url);
  authLayoutPage.goToRegisterPage();
  I.waitInUrl(registerPage.url, 5);
  registerPage.register(user);
  I.seeInCurrentUrl(loginPage.url);
  I.see('Your account has been created with success! Check your email', `//span[@data-notify='message']`);
});

Scenario('If I try to login, I am notified that my account is not verified', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  loginPage.login(user);
  I.see('Your account is not active! Check your email', `//span[@data-notify='message']`);
});

Scenario('I validate my mail address', async (I, loginPage, mailboxPage) => {
  I.amOnPage(mailboxPage.url);
  mailboxPage.validateRegistrationMail(user);
  I.switchToNextTab(1);
  I.waitInUrl(loginPage.url, 5);
  I.see('Your account has been activated with success!', `//span[@data-notify='message']`);
});

Scenario('I login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  loginPage.login(user);
  I.waitUrlEquals('/dashboard');
});
