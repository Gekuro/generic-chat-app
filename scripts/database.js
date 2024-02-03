import scripts from "./scripts.js";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export default {

    async connect() {
        if (process.env.MYSQL_RETRY !== "true") {
            await this._createConn();
            return;
        }

        console.log("Infinite retry of MySQL connection enabled!");
        while(true) {
            try {
                await this._createConn();
                console.log("Connected to MySQL");
                break;
            } catch(err) {
                console.log("Failed to connect to MySQL. Retrying...");
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    },

    async _createConn() {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_URL,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DB,
        });
        this.con = connection;
        await this.con.connect((err)=>{
            if(err)throw new Error(err);
        });
    },

    // create operations

    async add_user(name, password) {
        let password_hash = await bcrypt.hash(password, await bcrypt.genSalt())

        try{
            await this.con.query("INSERT INTO users (username, password) VALUES (?, ?)", [name, password_hash]);
            return;
        }catch(err){
            if(err.toString().includes('Duplicate')){
                throw new Error('User already exists!');
            }else{
                throw new Error(err);
            }
        }
    },

    async append_message(user, recipient, content) {
        // 'user' value is provided by express-session so its safe, but 'recipient' may be modified by a user so it needs to be validated
        if (!(await scripts.users.check_credential_validity(recipient, "Valid Password"))) throw new Error("SQL splicing attempt!");

        const sender_id = this.get_user_id(user);
        const recipient_id = this.get_user_id(recipient);

        await this.con.query(
            "INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)",
            [await sender_id, await recipient_id, content]
        );
    },

    // read operations

    async get_username_capitalization(name) {
        const response = (await this.con.query("SELECT username FROM users WHERE username = ?", [name]));
        if (!response[0]) {
            console.log({name, response});
            throw new Error("No such user!");
        }
        return response[0][0].username;
    },
    
    async get_message_snippets(name) {
        const user_id = await this.get_user_id(name);

        const response = (await this.con.query(
            "SELECT username 'name', send_time 'time', CONCAT('You: ',content) 'text' FROM messages INNER JOIN users ON recipient_id = user_id WHERE sender_id = ? UNION SELECT username 'name', send_time 'time', CONCAT(username,': ',content) 'text' FROM messages INNER JOIN users ON sender_id = user_id WHERE recipient_id = ?;",
            [user_id, user_id]
            ))[0];

        let latest_messages = {};

        for(let message of response){ // keep only latest message per conversation (other user name)
            if(latest_messages[message.name]){
                if(message.time > latest_messages[message.name].time){
                    latest_messages[message.name] = {'text': message.text, 'time': message.time};
                }
            }else{
                latest_messages[message.name] = {'text': message.text, 'time': message.time};
            }
        }

        let latest_messages_array = [];

        for(let name in latest_messages){ // convert dict to array
            latest_messages_array.push({
                'name':name,
                'time':latest_messages[name].time,
                'text':latest_messages[name].text
            });
        }

        return (await scripts.text_values.sort_and_format_messages_array(latest_messages_array, true));
    },

    async get_user_id(name) {
        const response = (await this.con.query(
            "SELECT user_id FROM users WHERE username = ?",
            [name]
        ));
        if(response[0].length === 0)throw new Error(`Cannot find user associated with the username ${name}`); // user doesn't exist

        return response[0][0].user_id;
    },

    async get_conversation(this_user, other_user) {
        if(!(await scripts.users.check_credential_validity(other_user, "validPassword")))throw new Error('Unusable credentials');
        const this_user_id = await this.get_user_id(this_user);
        const other_user_id = await this.get_user_id(other_user);
        
        const outgoing_messages = await this.get_messages(this_user_id, other_user_id);
        const incoming_messages = await this.get_messages(other_user_id, this_user_id);

        const all_messages = [...outgoing_messages.map(message => ({...message, "direction":"out"})),
        ...incoming_messages.map(message => ({...message, "direction":"in"}))];

        return (await scripts.text_values.sort_and_format_messages_array(all_messages));
    },

    async get_messages(sender_id, recipient_id) {
        return (await this.con.query(
            "SELECT send_time 'time', content 'text' FROM messages WHERE recipient_id = ? AND sender_id = ?;",
            [recipient_id, sender_id]
        ))[0];
    },

    // validation and formatting
    
    async validate_user(name, password) {
        const response = (await this.con.query("SELECT password FROM users WHERE username = ?", [name]));
        if(response[0].length === 0)return false; // user doesn't exist

        let correct_password_hash = response[0][0].password;

        if(await bcrypt.compare(password, correct_password_hash)){
            return true;
        }else{
            return false;
        }
    },


}
