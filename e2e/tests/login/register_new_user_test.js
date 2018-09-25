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
    //TODO add a check to ensure that user has been validated by server
});

Scenario('I login', (I, loginPage) => {
    I.amOnPage(loginPage.url);
    loginPage.login(user);
    //TODO add a check to ensure that the user is logged
});