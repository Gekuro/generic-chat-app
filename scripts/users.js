import scripts from "./scripts.js";

const users = {

    async register(name, password) {
        if(!this.check_credential_validity(name, password)) {
            throw new Error('Credentials are not fit to register!');
        }
        await scripts.db.add_user(name, password);
    },

    async login(name, password) {
        return (await scripts.db.validate_user(name, password) && this.check_credential_validity(name, password));
    },

    check_credential_validity(name, password) {
        if(name.length > 3
        && name.length < 15
        && password.length > 6
        && password.length < 19
        && ![...name,...password].some(char => [..."&=_'-+,<>;"].includes(char))) {
            return true;
        }else{
            return false;
        }
    }
}

export default { users };
