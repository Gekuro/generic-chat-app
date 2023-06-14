export default {

    // static strings

    credential_requirements_not_met: 'Your username should be between 4 and 14 characters, your password between 7 and 18 characters and both should not contain any of these characters: &=_\'-+,<>;',
    register_success: 'Successfully registered! You may now log in',
    server_error: 'Internal server error. Please try again',
    wrong_credentials: 'Wrong credentials',
    username_taken: 'Username is already taken',
    no_session_chat_page: 'Please log in before accessing chat page!',
    logged_out: 'Successfully logged out. You may log in again',
    unexisting_user: 'No such user! Please check the user name',
    loser_chat_attempt: 'You cannot start a chat with yourself. Don\'t be a loser!',

    // formatting methods

    format_time: async (time) => {
        const date_object = new Date(time);
        const today = new Date();

        const minutes = date_object.getMinutes().toString().padStart(2, '0');
        const hours = date_object.getHours().toString().padStart(2, '0');
        let [message_weekday, message_month_name, message_date, message_year] = date_object.toDateString().split(' ');

        const WEEK_IN_MILLISECONDS = 604800000;

        if(date_object.toDateString() === today.toDateString()){
            return `${hours}:${minutes}`;

        }else if((today - date_object) < WEEK_IN_MILLISECONDS){
            return `${message_weekday}, ${hours}:${minutes}`;

        }else{
            return `${message_date} ${message_month_name} ${message_year}`;

        }
    },

    sort_and_format_messages_array: async (messages, shorten_messages=false) => {
        messages.sort((a, b) => (a['time'] < b['time']) ? 1 : -1);

        for(const message of messages){ // format timestamps to appropriate text
            message.time = await this.format_time(message.time);
            if(message.text.length > 30 && shorten_messages){ // shorten message if needed
                message.text = message.text.substring(0,29) + '...';
            }
        }

        return messages;
    },
};
