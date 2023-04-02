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
        const query_text = `INSERT INTO users (username, password) VALUES ('${name}', '${password_hash}')`;

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
        const query_text = `SELECT password FROM users WHERE username = '${name}'`;

        const response = (await this.con.query(query_text));
        if(response[0].length == 0)return false; // user doesn't exist

        let correct_password_hash = response[0][0].password;

        if(await bcrypt.compare(password, correct_password_hash)){
            return true;
        }else{
            return false;
        }
    },
    
    async get_message_snippets(name) {
        const user_id = await this.get_user_id(name);
        const query_text = `SELECT username 'name', send_time 'time', CONCAT('You: ',content) 'text' FROM messages INNER JOIN users ON recipient_id = user_id WHERE sender_id = ${user_id} UNION SELECT username 'name', send_time 'time', CONCAT(username,': ',content) 'text' FROM messages INNER JOIN users ON sender_id = user_id WHERE recipient_id = ${user_id};`;

        const response = (await this.con.query(query_text))[0];
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

        return (await this.sort_and_format_messages_array(latest_messages_array, true));
    },

    async get_user_id(name) {
        const query_text = `SELECT user_id FROM users WHERE username = '${name}'`;

        const response = (await this.con.query(query_text));
        if(response[0].length == 0)throw new Error(`Cannot find user associated with the username ${name}`); // user doesn't exist

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

        return (await this.sort_and_format_messages_array(all_messages));
    },

    async get_messages(sender_id, recipient_id) {
        const query_text = `SELECT send_time 'time', content 'text' FROM messages WHERE recipient_id = ${recipient_id} AND sender_id = ${sender_id};`;

        return (await this.con.query(query_text))[0];
    },

    async format_time(time){
        // format time differently if it's today, this year etc.
        const date_object = new Date(time);
        const today = new Date();

        const minutes = date_object.getMinutes().toString().padStart(2, '0');
        const hours = date_object.getHours().toString().padStart(2, '0');
        let [message_weekday, message_month_name, message_date, message_year] = date_object.toDateString().split(' ');

        const WEEK_IN_MILLISECONDS = 604800000;

        if(date_object.toDateString() == today.toDateString()){
            return `${hours}:${minutes}`;
        }else if((today - date_object) < WEEK_IN_MILLISECONDS){
            return `${message_weekday}, ${hours}:${minutes}`;
        }else{
            return `${message_date} ${message_month_name} ${message_year}`;
        }
    },

    async sort_and_format_messages_array(messages, shorten_messages=false) {
        messages.sort((a, b) => (a['time'] < b['time']) ? 1 : -1);

        for(const message of messages){ // format timestamps to appropriate text
            message.time = await this.format_time(message.time);
            if(message.text.length > 30 && shorten_messages){ // shorten message if needed
                message.text = message.text.substring(0,29) + '...';
            }
        }

        return messages;
    },

    async append_message(user, recipient, content) {
        // 'user' value is provided by express-session so its safe, but 'recipient' may be modified by a user so it needs to be validated
        if (!(await scripts.users.check_credential_validity(recipient, "Valid Password"))) throw new Error("SQL splicing attempt!");

        const sender_id = this.get_user_id(user);
        const recipient_id = this.get_user_id(recipient);
        const query_text = `INSERT INTO messages (sender_id, recipient_id, content) VALUES ('${await sender_id}', '${await recipient_id}', '${content}')`;

        await this.con.query(query_text);
    }

}

db.con.connect((err)=>{
    if(err)throw new Error(err);
});

export default { db };
