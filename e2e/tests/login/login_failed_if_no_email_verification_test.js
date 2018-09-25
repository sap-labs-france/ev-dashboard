Feature('As a new registered user, I cannot login without activating my account @login');

let user;

BeforeSuite((I) => {
    user = I.amANewUser();
});

Scenario('I create my account', async (I, authLayout, registrationPage) => {
    I.amOnPage('/auth/login');
    I.wait(1);
    authLayout.goToRegistrationPage();
    registrationPage.register(user);
});

Scenario('If I try to login, I am notified that my account is not verified', (I, loginPage) => {
    I.amOnPage(loginPage.url);
    loginPage.login(user);
    I.waitForElement(`//span[@data-notify='message']`);
    I.waitForElement(`//div[@class='alert alert-danger alert-with-icon']`);
    I.see('Your account is not active! Check your email');
});
