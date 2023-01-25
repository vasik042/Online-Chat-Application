var user = null;
var username = null;

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        document.querySelector('#username-page').classList.add('hidden');
        document.querySelector('#chat-page').classList.remove('hidden');

        var socket = new SockJS('/ws');
        user = Stomp.over(socket);

        user.connect({}, onConnected);
    }
    event.preventDefault();
}

function onConnected() {
    user.subscribe('/chat', onMessageReceived);

    user.send("/addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
}

function sendMessage(event) {
    var messageContent = document.querySelector('#message').value.trim();

    if(messageContent && user) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'MESSAGE'
        };
        user.send("/sendMessage", {}, JSON.stringify(chatMessage));
        document.querySelector('#message').value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';

    } else {
        messageElement.classList.add('chat-message');

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    var messageArea = document.querySelector('#messageArea');

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
