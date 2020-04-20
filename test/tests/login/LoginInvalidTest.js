Feature('As an unknown user, I should not be able to login @login');

Scenario('If I try to login, I am notified that my credential is rejected', (I, loginPage) => {
  let user = I.amANewUser();
  I.amOnPage('/auth/login');
  I.wait(1);
  loginPage.login(user);
  I.see('Wrong email or password', `//span[@data-notify='message']`);
});
