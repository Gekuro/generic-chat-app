import scripts from "./scripts.js";
import mysql from "mysql2/promise";

const db = {

    con: await mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "generic_chat_app"
    }),

    async add_user(name, password) {
        const query = "INSERT INTO `users` (`username`, `password`) VALUES ('"+ name +"', '"+ password +"')";
        try{
            const response = await this.con.query(query);
        }catch(err){
            if(err.includes('duplicate')){
                throw new Error('User already exists!');
            }else{
                throw new Error(err);
            }
        }
        return;
    }

}

db.con.connect((err)=>{
    if(err)throw new Error(err);
})


export default { db };