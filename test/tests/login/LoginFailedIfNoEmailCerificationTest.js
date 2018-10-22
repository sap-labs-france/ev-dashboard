Feature('As a new registered user, I cannot login without activating my account @login');

let user;

BeforeSuite((I) => {
    user = I.amANewUser();
});

Scenario('I create my account', async (I, authLayoutPage, registerPage) => {
    I.amOnPage('/auth/login');
    I.wait(1);
    authLayoutPage.goToRegisterPage();
    registerPage.register(user);
    I.wait(1);
});

Scenario('If I try to login, I am notified that my account is not verified', (I, loginPage) => {
    I.amOnPage(loginPage.url);
    I.wait(1);
    loginPage.login(user);
    I.waitForElement(`//span[@data-notify='message']`);
    I.waitForElement(`//div[@class='alert alert-warning']`);
    I.see('Your account is not active! Check your email');
    I.wait(1);
});
