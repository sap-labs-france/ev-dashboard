const I = actor();

module.exports = {
  url: 'http://localhost:1080/',
  fields: {
    mailFrame: '.preview-iframe',
    actionUrl: '#action-url'

  },
  validateRegistrationMail(user) {
    I.click(`//span[contains(text(),'${user.email}')]`);
    within({
      frame: this.fields.mailFrame
    }, () => {
      I.click(this.fields.actionUrl);
    });
  }
};
