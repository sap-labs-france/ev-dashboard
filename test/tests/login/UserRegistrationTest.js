Feature('As a new registered user, I cannot login without activating my account @login');

let user;

BeforeSuite((I) => {
    user = I.amANewUser();
});

Scenario('I create my account', async (I, loginPage, authLayoutPage, registerPage) => {
    I.amOnPage(loginPage.url);
    authLayoutPage.goToRegisterPage();
    registerPage.register(user);
    I.see('Your account has been created with success! Check your email');
});

Scenario('If I try to login, I am notified that my account is not verified', (I, loginPage) => {
    I.amOnPage(loginPage.url);
    loginPage.login(user);
    I.waitForElement(`//span[@data-notify='message']`);
    I.waitForElement(`//div[@class='alert alert-warning']`);
    I.see('Your account is not active! Check your email');
});

Scenario('I validate my mail address', async (I, mailboxPage) => {
  I.amOnPage(mailboxPage.url);
  mailboxPage.validateRegistrationMail(user);
  I.switchToNextTab(1);
  I.waitInUrl('/verify-email', 5);
  I.waitInUrl('/auth/login', 5);
  I.waitForElement(`//span[@data-notify='message']`);
  I.waitForElement(`//div[@class='alert alert-success']`);
  I.see('Your account has been activated with success!');
});

Scenario('I login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  loginPage.login(user);
  I.waitInUrl('/dashboard', 5);
});
