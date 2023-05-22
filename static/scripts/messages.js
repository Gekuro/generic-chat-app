import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

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

    if (content.length > 30){
        content = content.substring(0,29) + '...';
    }

    if (current_user.toLocaleLowerCase() !== sender.toLocaleLowerCase()){
        content = `${sender}: ${content}`;
        if (conversation_button) {
            update_conversation_element('You', content, conversation_button);
        }else{
            create_conversation_element(sender, content);
        }
    }else{
        content = `You: ${content}`;
        if (conversation_button) {
            update_conversation_element(recipient, content, conversation_button);
        }else{
            create_conversation_element(recipient, content);
        }
    };
});

const update_conversation_element = async (sender, content, element) => {
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
