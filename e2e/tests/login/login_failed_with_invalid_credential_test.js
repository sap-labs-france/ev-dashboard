Feature('As unkown user, I should not be able to login @login');

Scenario('If I try to login, I am notified that my credential is rejected', (I, loginPage) => {
    let user = I.amANewUser();
    I.amOnPage('/auth/login');
    I.wait(1);
    loginPage.login(user);
    I.waitForElement(`//span[@data-notify='message']`);
    I.waitForElement(`//div[@class='alert alert-danger alert-with-icon']`);
    I.see('Wrong email or password');
});

