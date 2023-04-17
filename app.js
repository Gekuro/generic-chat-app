// frameworks
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

// other dependencies
import session from 'express-session';
import favicon from 'serve-favicon';
import cookie_parser from 'cookie-parser';
import path from 'path';
import { fileURLToPath as url_to_path } from 'url';

// local imports
import setRoutes from './routes.js'; // the behavior of the HTTP server is in this file
import setSocketEvents from './sockets.js'; // the behavior of the WS server is in here
import config from './presets.js';
import db from './scripts/database.js';

// server init
const app = express();
const server = http.Server(app);
const io = new SocketServer(server);

const dirname = path.dirname(url_to_path(import.meta.url));
const session_middleware = session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true
});
const session_wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

app.use(express.static('static'));
app.use(favicon(path.join(dirname, 'static/favicon.ico')));
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser());
app.use(session_middleware);
app.set('view engine', 'hbs');
app.set('views', path.join(dirname, 'views'));

io.use(session_wrap(session_middleware));

setRoutes(app);
setSocketEvents(io);

// start the server
io.listen(server);
server.listen(config.port, () => {
    console.log(`Server running on port: ${config.port}`);
});

db.con.connect((err)=>{
    if(err)throw new Error(err);
});
