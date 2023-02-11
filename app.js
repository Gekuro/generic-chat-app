import express from 'express';
import session from 'express-session';
import favicon from 'serve-favicon';
import cookie_parser from 'cookie-parser';
import path from 'path';
import { fileURLToPath as url_to_path } from 'url';
import scripts from './scripts/scripts.js';

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

// GET requests
app.get('/', async (req, res)=>{
    if(req.session.username){
        res.render('messages', {layout: 'layouts/main', title: 'Messages', messages: (await scripts.db.get_message_snippets(req.session.username))});
    }else{
        res.render('login', {layout: 'layouts/authentication', title: 'Log In'});
    }
});

app.get('/register', async (_, res)=>{
    res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
});

// POST requests
app.post('/log', async (req, res)=>{
    try{
        if(await scripts.users.login(req.body.username, req.body.password)){
            req.session.username = req.body.username;
            res.redirect('/');
        }else{
            res.render('login', {layout: 'layouts/authentication', title: 'Log In', error_messages: [scripts.messages.wrong_credentials]});

        }
    }catch(err){
        res.render('login', {layout: 'layouts/authentication', title: 'Log In', error_messages: [scripts.messages.server_error]});
        console.log(err);

    }
});

app.post('/new_user', async (req, res)=>{
    try{
        await scripts.users.register(req.body.username, req.body.password);
        res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_messages: [scripts.messages.register_success]});
        
    }catch(err){
        if(err.toString().includes("Credentials are not fit to register!")){
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.credential_requirements_not_met]});

        }else if(err.toString().includes("User already exists!")){
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.credential_requirements_not_met]});
            // TODO: add error message

        }else{
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.username_taken]});
            // TODO: add error message
            console.log(err);
        };
    }
});

app.listen(scripts.constants.port, ()=>{
    console.log(`Server running on port: ${scripts.constants.port}`);
});
