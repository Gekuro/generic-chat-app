// frameworks
import express from 'express';

// other dependencies
import session from 'express-session';
import favicon from 'serve-favicon';
import cookie_parser from 'cookie-parser';
import path from 'path';
import { fileURLToPath as url_to_path } from 'url';

// local imports
import scripts from './scripts/scripts.js';
import setRoutes from './routes.js';

// server init
const app = express();
const dirname = path.dirname(url_to_path(import.meta.url));

app.use(express.static('static'));
app.use(favicon(path.join(dirname, 'static/favicon.ico')));
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser());
app.use(session({
    secret: scripts.constants.session_secret,
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'hbs');
app.set('views', path.join(dirname, 'views'));
setRoutes(app);

// start the server
app.listen(scripts.constants.port, () => {
    console.log(`Server running on port: ${scripts.constants.port}`);
});
