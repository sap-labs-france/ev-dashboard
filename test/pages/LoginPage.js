const I = actor();

module.exports = {
  url: '/auth/login',
  fields: {
    email: '#email-field',
    password: '#password-field',
    acceptEula: '#eula-checkbox'
  },
  submitButton: {
    css: '#sign-in-button'
  },

  login(user) {
    I.fillField(this.fields.email, user.email);
    I.fillField(this.fields.password, user.password);
    I.click(this.fields.acceptEula);
    I.click(this.submitButton);
  }
};
