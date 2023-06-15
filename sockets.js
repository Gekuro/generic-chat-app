import scripts from './scripts/scripts.js';

const set_socket_events = async (io) => {
    io.on("connection", async (socket) => {
        const req = socket.request;
        const user = req.session.username;
        let recipient = req._query['recipient'];

        if (recipient) {
            recipient = await scripts.db.get_username_capitalization(recipient);
            handle_chat_connection(socket, user, recipient, io);
            return;
        }
        handle_messages_page_connection(socket, user);
    });

    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.username) {
            next();
            return;
        }
        next(new Error("Unauthorized connection attempt!"));
    });
}

const handle_chat_connection = async (socket, user, recipient, io) => {
    socket.join(user);

    socket.on("send", (data) => {
        if (!data || !data.content || typeof data.content !== "string") return;

        data = data.content;

        if (data.length > 350) return;

        try{
            scripts.db.append_message(user, recipient, data);
        }catch(err){
            console.error({err, user, recipient, data});
        }

        io.to(user).emit("append", user, recipient, data);
        io.to(recipient).emit("append", user, recipient, data);
    });
};

const handle_messages_page_connection = async (socket, user) => {
    socket.join(user);
};

export default set_socket_events;
