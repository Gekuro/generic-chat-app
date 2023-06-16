import scripts from './scripts/scripts.js';
import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_KEY_PRIVATE);

const set_routes = (server) => {
    // GET requests
    server.get('/', async (req, res) => {
        if(!req.session.username){
            res.render('login', {layout: 'layouts/authentication', title: 'Log In'});
            return;
        }
        res.render(
            'messages', 
            {
                layout: 'layouts/main', 
                title: 'Messages', 
                messages: (await scripts.db.get_message_snippets(req.session.username)), 
                name: req.session.username,
            });
    });

    server.get('/register', async (_, res) => {
        res.render('register', {layout: 'layouts/authentication', title: 'Sign Up'});
    });

    server.get('/chat*', async (req, res) => {
        try{
            if(!req.session.username){
                res.render(
                    'login', 
                    {
                        layout: 'layouts/authentication', 
                        title: 'Log In', 
                        error_messages: [scripts.text_values.no_session_chat_page],
                    });
                return;
            }
            if(req.session.username.toLocaleLowerCase() === req.query.user.toLocaleLowerCase()){
                res.render(
                    'messages',  
                    {
                        layout: 'layouts/main', 
                        title: 'Messages', 
                        messages: (await scripts.db.get_message_snippets(req.session.username)), 
                        name: req.session.username, 
                        error_messages: [scripts.text_values.loser_chat_attempt],
                    });
                return;
            }
            try{
                const messages = await scripts.db.get_conversation(req.session.username, req.query.user);
                res.render(
                    'chat', 
                    {
                        layout: 'layouts/main', 
                        title: `Chat with ${req.query.user}`, 
                        messages: messages, 
                        name: req.session.username,
                    });
            }catch{
                res.render(
                    'messages',  
                    {
                        layout: 'layouts/main', 
                        title: 'Messages', 
                        messages: (await scripts.db.get_message_snippets(req.session.username)), 
                        name: req.session.username, 
                        error_messages: [scripts.text_values.unexisting_user],
                    });
            }
        }catch(err){
            if(err.toString() === 'Unusable credentials' || !req.query.user){
                res.send("Link was tampered with, please use the UI to enter the chat page");
                return;
            }
            res.send(scripts.text_values.server_error);
            console.log({'unhandled exception: ':err});
        }
    });

    server.get('/logout', async (req, res) => {
        req.session.destroy();
        res.render(
            'login', 
            {
                layout: 'layouts/authentication', 
                title: 'Log In', 
                success_messages: [scripts.text_values.logged_out],
            });
    });

    // POST requests
    server.post('/log', async (req, res) => {
        try{
            if(await scripts.users.login(req.body.username, req.body.password)){
                req.session.username = await scripts.db.get_username_capitalization(req.body.username);
                res.redirect('/');
                return;
            }
            res.render(
                'login', 
                {
                    layout: 'layouts/authentication', 
                    title: 'Log In', 
                    error_messages: [scripts.text_values.wrong_credentials],
                });
        }catch(err){
            res.render(
                'login', 
                {
                    layout: 'layouts/authentication', 
                    title: 'Log In', 
                    error_messages: [scripts.text_values.server_error],
                });
            console.log({'unhandled exception: ':err});
        }
    });

    server.post('/new_user', async (req, res) => {
        try{
            await scripts.users.register(req.body.username, req.body.password);
            res.render('login', {layout: 'layouts/authentication', title: 'Log In', success_messages: [scripts.text_values.register_success]});
            
        }catch(err){
            if(err.toString().includes("Credentials are not fit to register!")){
                res.render(
                    'register', 
                    {
                        layout: 'layouts/authentication', 
                        title: 'Sign Up', 
                        error_messages: [scripts.text_values.credential_requirements_not_met],
                    });
                return;
            }
            if(err.toString().includes("User already exists!")){
                res.render(
                    'register', 
                    {
                        layout: 'layouts/authentication', 
                        title: 'Sign Up', 
                        error_messages: [scripts.text_values.username_taken]
                    });
                return;
            }
            res.render(
                'register', 
                {
                    layout: 'layouts/authentication', 
                    title: 'Sign Up', 
                    error_messages: [scripts.text_values.server_error]
                });
            console.log({'unhandled exception: ':err});
        }
    });

    server.post('/donate', async (req, res) => {
        if (!req.body.usd_amount) {
            res.end(JSON.stringify({'error':'missing request data'}));
            return;
        }
        if (!req.session.username) {
            res.end(JSON.stringify({'error':'you must be logged in to use this feature'}));
            return;
        }

        let checkout_session;

        try {
            checkout_session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                      price: process.env.STRIPE_DONATION_PRODUCT_ID,
                      quantity: 1,
                    },
                  ],
                success_url: process.env.PUBLIC_URL + ':' + process.env.HTTP_SERVER_PORT + '/',
                cancel_url: process.env.PUBLIC_URL + ':' + process.env.HTTP_SERVER_PORT + '/',
            });
        }catch(err){
            console.log({'unhandled exception: ':err});
            res.end(JSON.stringify({'error':'checkout session creation failed'}));
            return;
        }

        res.end(JSON.stringify({'url': checkout_session.url}));
    });
}

export default set_routes;
