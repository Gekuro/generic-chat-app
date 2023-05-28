import scripts from './scripts/scripts.js';

const set_routes = (server) => {
    // GET requests
    server.get('/', async (req, res)=>{
        if(req.session.username){
            res.render('messages', {layout: 'layouts/main', title: 'Messages', messages: (await scripts.db.get_message_snippets(req.session.username)), name: req.session.username});
        }else{
            res.render('login', {layout: 'layouts/authentication', title: 'Log In'});
        }
    });

    server.get('/register', async (_, res)=>{
        res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
    });

    server.get('/chat*', async (req, res)=>{
        // TODO: handle non-existing users and wrong creds

        try{
            if(!req.session.username){
                res.render('login', {layout: 'layouts/authentication', title: 'Log In', error_messages: [scripts.messages.no_session_chat_page]});
            }else{
                if(req.session.username.toLocaleLowerCase() == req.query.user.toLocaleLowerCase()){
                    res.render('messages',  {layout: 'layouts/main', title: 'Messages', messages: (await scripts.db.get_message_snippets(req.session.username)), name: req.session.username, error_messages: [scripts.messages.loser_chat_attempt]});
                }
                try{
                    const messages = await scripts.db.get_conversation(req.session.username, req.query.user);
                    res.render('chat', {layout: 'layouts/main', title: `Chat with ${req.query.user}`, messages: messages, name: req.session.username});
                }catch{
                    res.render('messages',  {layout: 'layouts/main', title: 'Messages', messages: (await scripts.db.get_message_snippets(req.session.username)), name: req.session.username, error_messages: [scripts.messages.unexisting_user]});
                }
            }
        }catch(err){
            if(err.toString() == 'Unusable credentials' || !req.query.user){
                res.send("Link was tampered with, please use the UI to enter the chat page");
            }else{
                res.send(scripts.messages.server_error);
                console.log({'unhandled exception: ':err});
            }
        }
    });

    server.get('/logout', async (req, res)=>{
        req.session.destroy();
        res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_messages: [scripts.messages.logged_out]});
    });

    // POST requests
    server.post('/log', async (req, res)=>{
        try{
            if(await scripts.users.login(req.body.username, req.body.password)){
                req.session.username = await scripts.db.get_username_capitalization(req.body.username);
                res.redirect('/');
            }else{
                res.render('login', {layout: 'layouts/authentication', title: 'Log In', error_messages: [scripts.messages.wrong_credentials]});

            }
        }catch(err){
            res.render('login', {layout: 'layouts/authentication', title: 'Log In', error_messages: [scripts.messages.server_error]});
            console.log({'unhandled exception: ':err});
        }
    });

    server.post('/new_user', async (req, res)=>{
        try{
            await scripts.users.register(req.body.username, req.body.password);
            res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_messages: [scripts.messages.register_success]});
            
        }catch(err){
            if(err.toString().includes("Credentials are not fit to register!")){
                res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.credential_requirements_not_met]});

            }else if(err.toString().includes("User already exists!")){
                res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.username_taken]});

            }else{
                res.render('register', {layout: 'layouts/authentication', title: 'Sign Up', error_messages: [scripts.messages.server_error]});
                console.log({'unhandled exception: ':err});
            };
        }
    });
}

export default set_routes;
