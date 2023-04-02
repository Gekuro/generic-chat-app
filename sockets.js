const setSocketEvents = (io) => {
    io.on("connection", (socket) => {
        const req = socket.request;
        const user = req.session.username;

        socket.on("send", (data) => {
            console.log({user, data});
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