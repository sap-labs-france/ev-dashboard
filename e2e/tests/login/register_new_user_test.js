Feature('As a new registered user, I can login @login');

let user;

BeforeSuite((I, mailServer) => {
    user = I.amANewUser();
    mailServer.start();
});

AfterSuite((I, mailServer) => mailServer.stop());

Scenario('I create my account', async (I, authLayout, registrationPage) => {
    I.amOnPage('/auth/login');
    I.wait(1);
    authLayout.goToRegistrationPage();
    registrationPage.register(user);
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

