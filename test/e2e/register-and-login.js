import 'dotenv/config';
import { expect } from "chai";
import puppeteer from 'puppeteer';
import { authentication_page } from './pages/authentication-page.js';
import { messages_page } from './pages/messages-page.js';

const browser = await puppeteer.launch({headless: false});
const RANDOM_DIGITS_NO = 7;
const username = "tester" + Math.floor( Math.random()*(10**RANDOM_DIGITS_NO) );
const password = "zaq1@WSX";

let page;

describe('checking user registration and login', async () => {
    before(async () => {
        page = await browser.newPage();
        await page.goto(`http://localhost:${process.env.HTTP_SERVER_PORT}/`);
    });

    it('the register page should not allow registering in with incorrect credentials', async () => {
        await page.click(authentication_page.link_other_page);

        await fill_authentication_form('2', 'short');
        const msg = await page.$eval(authentication_page.div_message, elem => elem.innerText);

        expect(msg).to.include('username should be between');
    });

    it('the register page should allow registering in with correct credentials', async () => {
        await fill_authentication_form(username, password);
        const msg = await page.$eval(authentication_page.div_message, elem => elem.innerText);

        expect(msg).to.include('Successfully registered');
    });

    it('the user shouldn\'t be able to login with incorrect credentials', async () => {
        await fill_authentication_form(username, 'XSW@1qaz');
        const msg = await page.$eval(authentication_page.div_message, elem => elem.innerText);

        expect(msg).to.include('Wrong credentials');
    });

    it('the user should be able to login with correct credentials', async () => {
        await fill_authentication_form(username, password);
        const displayed_name = await page.$eval(messages_page.span_name, elem => elem.innerText);

        expect(displayed_name).to.equal(username);
    });

    it('the session should persist after page reload', async () => {
        await page.goto(`http://localhost:${process.env.HTTP_SERVER_PORT}/`);
        const displayed_name = await page.$eval(messages_page.span_name, elem => elem.innerText);

        expect(displayed_name).to.equal(username);
    });

    it('the user should be able to logout', async () => {
        await page.click(messages_page.link_logout);
        const msg = await page.$eval(authentication_page.div_message, elem => elem.innerText);

        expect(msg).to.include('logged out');
    });

    it('the logout should persist after page reload', async () => {
        await page.goto(`http://localhost:${process.env.HTTP_SERVER_PORT}/`);
        const link_label = await page.$eval(authentication_page.link_other_page, elem => elem.innerText);

        // the link button points to the other page, so on Log In page it says 'Register'
        expect(link_label).to.include('Register');
    });

    after(async () => {
        await browser.close();
    });

    async function fill_authentication_form(name, pwd) {
        await page.type(authentication_page.input_login, name);
        await page.type(authentication_page.input_password, pwd);
        await page.click(authentication_page.input_submit);
    }
});
