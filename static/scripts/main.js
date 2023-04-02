import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const sender_box = document.querySelector("#message_input");
const socket = io.connect();

// getting recipient name from url query
const url = window.location.href;
const searchParams = new URLSearchParams(url.substring(url.indexOf('?')));
const recipient = searchParams.get("user");

// message textbox functionality
sender_box.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (sender_box.value.length == 0){
            console.error("Return was pressed but there's no data to be sent!");
        } else {
            console.log(socket);
            socket.emit("send", {content: sender_box.value, recipient: recipient});
        }

        sender_box.value = "";
    }
});

