import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import scripts from './scripts/scripts.js';

const app = express();
const port = 81;
const dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static('static'));
app.use(favicon(path.join(dirname, 'static/favicon.ico')));
app.use(express.urlencoded());
app.set('view engine', 'hbs');
app.set('views', path.join(dirname, 'views'));

// GET requests
app.get('/', async (_, res)=>{
    res.render('login', {layout: 'layouts/authentication', title: 'Log In'});
});

app.get('/register', async (_, res)=>{
    res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
});

// POST requests
app.post('/log', async (req, res)=>{
    try{
        if(await scripts.users.login(req.body.username, req.body.password)){
            res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_messages: ['Successfully logged in!'], error_messages: ['Messages page was not implemented yet :(']});
            // TODO: create a session and navigate to messages page

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
        res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_message: [scripts.messages.register_success]});
        
    }catch(err){
        if(err.toString().includes("Credentials are not fit to register!")){
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.credential_requirements_not_met]});

        }else if(err.toString().includes("User already exists!")){
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
            // TODO: add error message

        }else{
            res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
            // TODO: add error message
            console.log(err);
        };
    }
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});
