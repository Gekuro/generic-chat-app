import 'dotenv/config'; // db credentials are required for users module

import scripts from "../scripts/scripts.js";
import { expect } from "chai";

describe('checking the validity of provided credentials', async () => {

    it('too short and too long passwords should not be allowed', async () => {
        const short_result = await scripts.users.check_credential_validity(
            "validName",
            "123",
        );

        const long_result = await scripts.users.check_credential_validity(
            "validName",
            "1234567890123456789",
        );

        expect(short_result, 'too short password was not rejected').to.be.false;
        expect(long_result, 'too long password was not rejected').to.be.false;
    });

    it('too short and too long usernames should not be allowed', async () => {
        const short_result = await scripts.users.check_credential_validity(
            "123",
            "validPwd",
        );

        const long_result = await scripts.users.check_credential_validity(
            "1234567890123456789",
            "validPwd",
        );

        expect(short_result, 'too short username was not rejected').to.be.false;
        expect(long_result, 'too long username was not rejected').to.be.false;
    });

    it('all illegal characters should not be allowed', async () => {

        [..."&=_'-+,<>;"].forEach(async (char) => {
            expect(
                await scripts.users.check_credential_validity(`aaa${char}aaa`,`aaaaaaa`),
                `illegal character ${char} was allowed in the username`
            ).to.be.false;

            expect(
                await scripts.users.check_credential_validity(`aaaaaaa`,`aaa${character}aaa`),
                `illegal character ${char} was allowed in the password`
            ).to.be.false;
        });

    });

    it('should allow correct credentials', async () => {

        const valid_result = await scripts.users.check_credential_validity(
            "test.user123",
            "zaq1@WSX",
        );

        expect(valid_result).to.be.true;

    });

    after(async () => {
        await scripts.db.con.close();
    });

});
