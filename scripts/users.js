import scripts from "./scripts.js";

const users = {

    register(name, password) {
        if(!this.check_credential_validity(name, password)){
            throw new Error('Credentials are not fit to register!');
        }
        scripts.db.add_user(name, password);
    },

    check_credential_validity(name, password) {
        if(name.length > 3
        && name.length < 15
        && password.length > 7
        && password.length < 31
        && !name.includes(";")
        && !name.includes("-")
        && !password.includes(";")
        && !password.includes("-")) {
            return true;
        }else{
            return false;
        }
    }
}



export default { users };