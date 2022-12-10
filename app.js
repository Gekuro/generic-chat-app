const express = require('express');
const path = require('path');
const app = express();

const port = 8000;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.use(express.static('static'));

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});
