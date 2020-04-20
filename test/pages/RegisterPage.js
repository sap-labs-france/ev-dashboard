const I = actor();

module.exports = {
  url: '/auth/register',
  fields: {
    firstName: '#first-name-field',
    lastName: '#last-name-field',
    email: '#email-field',
    password: '#password-field',
    passwordRepeat: '#password-repeat-field',
    acceptEula: '#eula-checkbox',
    captcha: '#captcha-checkbox'
  },
  submitButton: {
    css: '#register-button'
  },

  register(user) {
    I.fillField(this.fields.firstName, user.firstName);
    I.fillField(this.fields.lastName, user.lastName);
    I.fillField(this.fields.email, user.email);
    I.fillField(this.fields.password, user.password);
    I.fillField(this.fields.passwordRepeat, user.password);
    I.click(this.fields.acceptEula);
    I.click(this.fields.captcha);
    I.wait(2);
    I.click(this.submitButton);
  }
};
