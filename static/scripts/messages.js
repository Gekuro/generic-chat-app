import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";


// socket handling

const socket = io.connect(window.location.host, {
    reconnectionDelayMax: 10000
});

socket.on("append", (sender, recipient, content) => {
    const current_user = document.querySelector("#username").innerText;
    const conversation_buttons = [...document.querySelectorAll("div.message")];

    console.log(conversation_buttons);

    const conversation_button = conversation_buttons.find(element => {
        const name = element.querySelector(".username").innerText;
        return ((name.toLocaleLowerCase() === sender.toLocaleLowerCase() || name.toLocaleLowerCase() === recipient.toLocaleLowerCase()) ? true : false);
    });

    const parse_message_and_update_element = async (prefix, other_user) => {
        content = `${prefix}: ${content}`;

        if (content.length > 30){
            content = content.substring(0,29) + '...';
        };

        if (conversation_button) {
            update_conversation_element(content, conversation_button);
        }else{
            create_conversation_element(other_user, content);
        }
    };

    if (current_user.toLocaleLowerCase() !== sender.toLocaleLowerCase()){
        parse_message_and_update_element(sender, sender);
        // the latest message in conversation with user x was sent by user x
    }else{
        parse_message_and_update_element("You", recipient);
    };
});

const update_conversation_element = async (content, element) => {
    const current_time = new Date();
    const current_time_text = `${current_time.getHours()}:${('0'+current_time.getMinutes()).slice(-2)}`;

    element.querySelector(".content").innerText = content;
    element.querySelector(".time").innerText = current_time_text;
};

const create_conversation_element = async (other_user, content) => {
    const current_time = new Date();
    const current_time_text = `${current_time.getHours()}:${('0'+current_time.getMinutes()).slice(-2)}`;

    const conversation_wrap = document.createElement("div");
    conversation_wrap.className = "message";

    const content_element = document.createElement("div");
    content_element.className = "content";
    content_element.innerText = content;

    const username_element = document.createElement("div");
    username_element.className = "username";
    username_element.innerText = other_user;

    const date_element = document.createElement("div");
    date_element.className = "time";
    date_element.innerText = current_time_text;

    conversation_wrap.append(username_element, content_element, date_element);
    conversation_wrap.setAttribute("onclick", `location.href='chat?user=${other_user}';`);

    document.querySelector("div#messages_container").prepend(conversation_wrap);
};

// donate button

const donate_btn = document.querySelector("#donate_button");

donate_btn.addEventListener("click", async () => {
    const res = await fetch('/donate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usd_amount: 10.0,
        }),
    });

    if (!res.ok) {
        console.error("Connection issue while creating checkout session");
        return;
    }

    const body = await res.json();

    if (!body.url) {
        console.error(body);
        return;
    }

    window.location.href = body.url;
});
