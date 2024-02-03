// frameworks
import express from 'express';
import { Server as SocketServer } from 'socket.io';

// other dependencies
import redis from 'redis';
import RedisStore from 'connect-redis';
import session from 'express-session';
import favicon from 'serve-favicon';
import cookie_parser from 'cookie-parser';
import http from 'http';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath as url_to_path } from 'url';

// local imports
import set_routes from './routes.js'; // the behavior of the HTTP server is in this file
import set_socket_events from './sockets.js'; // the behavior of the WS server is in here
import db from './scripts/database.js';

// server init
const express_app = express();
const server = http.Server(express_app);
const socket_io = new SocketServer(server);

// MySQL init
db.connect();

// Redis init
const redis_client = redis.createClient({
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_PORT
    }
});
redis_client.connect();
redis_client.on("error", (err) => console.error(`Error connecting to Redis: ${err}`));

const dirname = path.dirname(url_to_path(import.meta.url));
const session_middleware = session({
    store: new RedisStore({ client: redis_client, prefix: process.env.REDIS_VALUE_PREFIX }),
    secret: process.env.HTTP_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: (process.env.LIMIT_COOKIES_TO_HTTPS === "true") }
});

express_app.use(express.static('static'));
express_app.use(favicon(path.join(dirname, 'static/favicon.ico')));
express_app.use(express.urlencoded({extended: true}));
express_app.use(express.json());
express_app.use(cookie_parser());
express_app.use(session_middleware);
express_app.set('view engine', 'hbs');
express_app.set('views', path.join(dirname, 'views'));

socket_io.use((socket, next) => session_middleware(socket.request, {}, next));

set_routes(express_app);
set_socket_events(socket_io);

// start the server
socket_io.listen(server);
server.listen(process.env.HTTP_SERVER_PORT, () => {
    console.log(`Server running on port: ${process.env.HTTP_SERVER_PORT}`);
});
