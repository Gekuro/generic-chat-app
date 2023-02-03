import express from 'express';
import favicon from 'serve-favicon';
import hbs from 'express-handlebars';

import path from 'path';
import { fileURLToPath } from 'url';

import scripts from './scripts/scripts.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const port = 81;

const app = express();
app.use(express.static('static'));
app.use(favicon(path.join(dirname, 'static/favicon.ico')));
app.use(express.urlencoded());

// GET requests
app.get('/', (_, res)=>{
    res.sendFile(path.join(dirname, '/views/login.html'));
});

app.get('/register', (_, res)=>{
    res.sendFile(path.join(dirname, '/views/register.html'));
});

// POST requests
app.post('/log', (req, res)=>{
    console.log(req.body);
    res.end();
});

app.post('/new_user', (req, res)=>{
    try{
        scripts.users.register(req.body.username, req.body.password);
        res.end();
    }catch(_){
        res.end();
        // TODO: navigate to the register page and generate an error message
    }
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});
