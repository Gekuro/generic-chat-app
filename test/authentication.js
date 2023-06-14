import 'dotenv/config';

import scripts from "../scripts/scripts.js";
import bcrypt from "bcryptjs";
import { expect } from "chai";

// bottom up integration

describe('checking the validity of database operations', async () => {

    const RANDOM_DIGITS_NO = 7;
    const username_1 = "tester" + Math.floor( Math.random()*(10**RANDOM_DIGITS_NO) );
    const username_2 = "tester" + Math.floor( Math.random()*(10**RANDOM_DIGITS_NO) );
    const password = "zaq1@WSX";
    
    it('creating user manually in the database', async () => {
        let password_hash = await bcrypt.hash(password, await bcrypt.genSalt())
        await scripts.db.con.query("INSERT INTO users (username, password) VALUES (?, ?)", [username_1, password_hash]);
    });

    let response;

    it('retrieving the users password\'s hash from the database should be possible', async () => {
        response = await scripts.db.con.query("SELECT password FROM users WHERE username = ?", [username_1]);

        expect(response).to.not.be.empty;
    });

    it('the retrieved hash should match the correct password\'s hash', async () => {
        const correct_hash = response[0][0].password;

        expect(await bcrypt.compare(password, correct_hash)).to.be.true;
    });

    it('creating user with the scripts/users.js module', async () => {
        await scripts.users.register(username_2, password);
    });

    it('validating user with the scripts/users.js module', async () => {
        expect(await scripts.users.login(username_2, password)).to.be.true;
    });

    it('validating with the wrong password shouldn\'t be possible', async () => {
        expect(await scripts.users.login(username_2, "XSW@1qaz")).to.be.false;
    });

    it('creating duplicate users should be prohibited', async () => {
        let error;
        try {
            await scripts.users.register(username_2, password);
        } catch(err) { error = err; }

        expect(error).to.not.be.undefined;
    });

    it('should be able to retrieve the ID of the manually created user, by using the scripts/database.js module', async () => {
        const id = await scripts.db.get_user_id(username_1);

        expect(id).to.be.a("number");
    });

    it('should be able to retrieve the ID of the user created with scripts/users.js module, by querying the database directly', async () => {
        response = (await scripts.db.con.query(
            "SELECT user_id FROM users WHERE username = ?", [username_2]));

        expect(response[0]).to.not.be.empty;
        expect(response[0][0].user_id).to.be.a("number");
    });

});