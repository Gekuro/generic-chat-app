<div align='center'><img src="static/icon.png" alt="Logo" width="80px" height="80px"></div>
<h1 align='center' style="border-bottom: none;">Generic Chat App</h1>

# Project description

This is a simple chat app I am making in an effort to learn back-end development.<br/>
The messages and user credentials are stored in a simple MySQL database. Passwords are hashed before storing using bcrypt.<br/> Browser sessions are stored in Redis, which allows for running multiple instances of the application behind a reverse proxy perhaps.

# Built with

Back-end: Node.JS, Express, Socket.IO<br/>
Databases: MySQL (users, messages), Redis (cookie sessions)<br />
Testing: Mocha, Chai, Puppeteer<br />
Other notable dependencies: bcryptJS, Handlebars

# To run

## You will need to have installed (and running):
 - MySQL Server
 - Redis
 - Node.JS
## Pull the repository:
 ```
    git clone https://github.com/Gekuro/generic-chat-app.git

    cd generic-chat-app
 ```
## Import the database schema:
The .sql script will create a database "generic-chat-app", so there is no reason to create one beforehand.

PowerShell:
 ```
    Get-Content .\create-database.sql | mysql -uroot -p
 ```
Bash:
 ```
    cat ./create-database.sql | mysql -uroot -p
 ```
## Install the Node dependencies:
 ```
    npm i
 ```
## Specify the connection details and run:
 Edit the .env file, to specify credentials, the session secret and addresses of the Redis and MySQL server instances.
 If everything seems in order, run the application:
 ```
    npm start
 ```
## Run tests:
 To run the automated tests execute (excluding end-to-end tests):
 ```
    npm run test
 ```
 If you want to run e2e tests, the following command runs all tests including e2e, but keep in mind that running this command will require you to run the application in a separate process.
 ```
    npm run e2e
 ```

 Docker image coming soon :)