const sender_box = document.querySelector("#message_input");

sender_box.addEventListener("keypress", (event) => {
    
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (sender_box.value.length == 0){
            console.error("Return was pressed but there's no data to be sent!");
        } else {
            console.log({action:"new_message", content:sender_box.value});
        }

        sender_box.value = "";
    }
    
});