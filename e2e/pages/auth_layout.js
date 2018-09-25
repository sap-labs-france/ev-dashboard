const I = actor();

module.exports = {
    links: {
        register: "#register-link",
        signIn: "#sign-in-link",
        retrievePassword: "#retrieve-password-link"
    },
    goToRegistrationPage() {
        I.click(this.links.register);
    },
    goToSignInPage() {
        I.click(this.links.signIn);
    },
    goToRetreivePasswordPage() {
        I.click(this.links.retrievePassword);
    },
};
