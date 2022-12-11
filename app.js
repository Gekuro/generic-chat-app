const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const app = express();

const port = 80;
app.use(express.static('static'));
app.use(favicon(path.join(__dirname,'static/favicon.ico')));
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (_, res)=>{
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.post('/log', (req, res)=>{
    console.log(req.body);
    res.end();
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});
