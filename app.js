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
import { fileURLToPath as url_to_path } from 'url';

// local imports
import set_routes from './routes.js'; // the behavior of the HTTP server is in this file
import set_socket_events from './sockets.js'; // the behavior of the WS server is in here
import config from './presets.js';
import db from './scripts/database.js';

// server init
const express_app = express();
const server = http.Server(express_app);
const socket_io = new SocketServer(server);

// Redis init
const redis_client = redis.createClient(config.redis_params);
redis_client.connect();
redis_client.on("error", (err) => console.error(`Error connecting to Redis: ${err}`));

const dirname = path.dirname(url_to_path(import.meta.url));
const session_middleware = session({
    store: new RedisStore({ client: redis_client, prefix: config.redis_val_prefix }),
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true,
    cookie: config.cookie_presets
});

express_app.use(express.static('static'));
express_app.use(favicon(path.join(dirname, 'static/favicon.ico')));
express_app.use(express.urlencoded({extended: true}));
express_app.use(cookie_parser());
express_app.use(session_middleware);
express_app.set('view engine', 'hbs');
express_app.set('views', path.join(dirname, 'views'));

socket_io.use((socket, next) => session_middleware(socket.request, {}, next));

set_routes(express_app);
set_socket_events(socket_io);

// start the server
socket_io.listen(server);
server.listen(config.port, () => {
    console.log(`Server running on port: ${config.port}`);
});

db.con.connect((err)=>{
    if(err)throw new Error(err);
});
