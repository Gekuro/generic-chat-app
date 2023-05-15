export default {
    port: 80,
    session_secret: "change me!",
    mysql_params: {
        host: "localhost",
        user: "root",
        password: "zaq1@WSX",
        database: "generic-chat-app"
    },
    redis_params: {
        socket: {
            host: "localhost",
            port: "6379"
        }
    },
    redis_val_prefix: "gca:",
    cookie_presets: {
        secure: false, // limit cookies to HTTPS
    }
};
