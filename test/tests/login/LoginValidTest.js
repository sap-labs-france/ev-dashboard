Feature('I should be able to login with Super Admin, Admin, Basic Demo users @login');

Scenario('Super Admin user login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  let user = I.amASuperAdminUser();
  loginPage.login(user);
  I.waitInUrl('/dashboard', 5);
});

Scenario('Admin user login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  let user = I.amAnAdminUser();
  loginPage.login(user);
  I.waitInUrl('/dashboard', 5);
});

Scenario('Basic user login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  let user = I.amABasicUser();
  loginPage.login(user);
  I.waitInUrl('/dashboard', 5);
});

Scenario('Demo user login', (I, loginPage) => {
  I.amOnPage(loginPage.url);
  let user = I.amABasicUser();
  loginPage.login(user);
  I.waitInUrl('/dashboard', 5);
});
