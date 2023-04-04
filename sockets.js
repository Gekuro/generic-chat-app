import scripts from './scripts/scripts.js';

const setSocketEvents = (io) => {
    io.on("connection", (socket) => {
        const req = socket.request;
        const user = req.session.username;
        const recipient = req._query['recipient'];

        const room_name = (user.localeCompare(recipient) > 0) ? `${user}-${recipient}` : `${recipient}-${user}`;
        socket.join(room_name);

        socket.on("send", (data) => {
            if (data && data.content && typeof data.content == "string") {
                data = data.content;

                if (data.length > 350) return;

                try{
                    scripts.db.append_message(user, recipient, data);
                }catch(err){
                    console.error({err, user, recipient, data});
                }

                io.to(room_name).emit("append", user, data);
            }
        });
    });

    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.username) {
            next();
        } else {
            next(new Error("Unauthorized connection attempt!"));
        }
    });
}

export default setSocketEvents;