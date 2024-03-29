import scripts from "./scripts.js";

export default {

    async register(name, password) {
        if(!(await this.check_credential_validity(name, password))) {
            throw new Error('Credentials are not fit to register!');
        }
        await scripts.db.add_user(name, password);
    },

    async login(name, password) {
        if(!(await this.check_credential_validity(name, password))) {
            return false;
        }
        return await scripts.db.validate_user(name, password);
    },

    async check_credential_validity(name, password) {
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
};
