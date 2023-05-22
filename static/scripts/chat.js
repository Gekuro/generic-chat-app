import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

// getting recipient name from url query

const url = window.location.href;
const searchParams = new URLSearchParams(url.substring(url.indexOf('?')));
const other_user = searchParams.get("user");

const sender_box = document.querySelector("#message_input");
const socket = io.connect(window.location.host, {
    query: `recipient=${other_user}`,
    reconnectionDelayMax: 10000,
});

socket.on("append", (sender, recipient, content) => {
    // if message was sent by current user on different tab, and is not a part of this conversation, do nothing
    if(other_user.toLocaleLowerCase() !== recipient.toLocaleLowerCase() && other_user.toLocaleLowerCase() !== sender.toLocaleLowerCase()) return; 

    const direction = (other_user.toLocaleLowerCase() === sender.toLocaleLowerCase()) ? "direction_in" : "direction_out";

    let message_dom_element = create_message_element(content, direction);

    document.querySelector("div#chat_container").prepend(message_dom_element);
});

// message textbox functionality

sender_box.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (sender_box.value.length === 0){
            console.error("Return was pressed but there's no data to be sent!");
        } else {
            socket.emit("send", {content: sender_box.value});
        }

        sender_box.value = "";
    }
});

const create_message_element = (content, direction) => {
    const current_time = new Date();
    const current_time_text = `${current_time.getHours()}:${('0'+current_time.getMinutes()).slice(-2)}`;

    const message_wrap = document.createElement("div");
    message_wrap.className = "chat_message_wrap";

    const message_element = document.createElement("div");
    message_element.className = `chat_message ${direction}`;
    message_element.innerText = content;

    const date_element = document.createElement("div");
    date_element.className = "date_container";
    date_element.innerText = current_time_text;

    message_element.appendChild(date_element);
    message_wrap.appendChild(message_element);
    
    return message_wrap;
};
