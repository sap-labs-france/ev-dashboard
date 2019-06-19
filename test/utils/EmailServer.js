const MailDev = require('maildev');

const maildev = new MailDev({
  smtp: 1025,
  incomingUser: "e2e",
  incomingPass: "e2e",
  silent: true,
});

module.exports = {
  async start() {
    return new Promise(
      (resolve, reject) => {
        maildev.listen((error) => !error ? resolve() : reject(error));
      }
    );
  },
  async stop() {
    return new Promise(
      (resolve, reject) => {
        maildev.close((error) => {
          if (!error) {
            return resolve();
          } else {
            console.log(`mail server stop error: ${JSON.stringify(error, {}, 2)}`);
            return reject(error);
          }
        });
      }
    );
  },
  async deleteAllEmail() {
    return new Promise(
      (resolve, reject) => {
        maildev.deleteAllEmail((error) => !error ? resolve() : reject(error));
      }
    );
  }
};
