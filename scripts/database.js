import scripts from "./scripts.js";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const db_connection_params = {
    host: "localhost",
    user: "root",
    database: "generic_chat_app"
}

const db = {

    con: await mysql.createConnection(db_connection_params),

    async add_user(name, password) {
        let password_hash = await bcrypt.hash(password, await bcrypt.genSalt())
        const query_text = "INSERT INTO `users` (`username`, `password`) VALUES ('"+ name +"', '"+ password_hash +"')";

        try{
            await this.con.query(query_text);
            return;
        }catch(err){
            if(err.toString().includes('Duplicate')){
                throw new Error('User already exists!');
            }else{
                throw new Error(err);
            }
        }
    },

    async validate_user(name, password) {
        const query_text = "SELECT `password` FROM `users` WHERE `username` = '"+ name +"'";

        const response = (await this.con.query(query_text));
        if(response[0].length == 0)return false; // user doesn't exist

        let correct_password_hash = response[0][0].password;

        if(await bcrypt.compare(password, correct_password_hash)){
            return true;
        }else{
            return false;
        }
    }

}

db.con.connect((err)=>{
    if(err)throw new Error(err);
});

export default { db };
