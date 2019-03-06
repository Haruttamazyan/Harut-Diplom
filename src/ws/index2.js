let token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNGIzNjE1LTFjOWQtNGQxYi1iYjk1LWE3YjZjNTBkYWQyZCIsInJvbGUiOiJzeXN0ZW0tYWRtaW4iLCJjb21wYW55SWQiOiI0ODljYTU4Mi0wZWQzLTRhMGEtOTRhOS04YzJiMDIyOWU3YWMiLCJpYXQiOjE1NDE3NzI3MTAsImV4cCI6MTU0MTk0NTUxMCwianRpIjoiZWQtdjItand0LWlkIn0.aMLoJCjIi060ZJNcNx1NVylWSfRgcRozYpJPLeoNyO4';
console.log('test')
let io = require('socket.io-client');

let agent_websock = io.connect('http://localhost:9000', {
    query: {token: token},
    secure: true,
    rejectUnauthorized: false
});
let cdr_websock = io.connect('http://localhost:12000', {
    query: {token: token},
    secure: true,
    rejectUnauthorized: false
});
let event_websock = io.connect('http://localhost:10000'/*, {
    query: {token: token},
    secure: true,
    rejectUnauthorized: false
}*/);

let agent_uuid = '2d7b9269-1fb3-4606-bdb2-3c1f4c67de83';

agent_websock.on('connect', function () {
    console.log('agent');
    agent_websock.on(`agent_${agent_uuid}`, (data) => {
        console.log('agent-data--->',data)
    })
});

agent_websock.onclose = () => {
    console.log("Connection closed");
    agent_websock.close();
};

agent_websock.onerror = (error) => {
    console.log(error, 'error ag')
};

event_websock.on('connect', function () {
    console.log('event')
    event_websock.on(`event_${agent_uuid}`, (data) => {
        console.log('event-data--->',data )
    });

});
event_websock.onclose = () => {
    console.log("Connection closed");
    agent_websock.close();
};

event_websock.onerror = (error) => {
    console.log(error, 'error ev')
};


cdr_websock.on('connect', function () {
    console.log('cdr')
    cdr_websock.on(`cdr_${agent_uuid}`, (data) => {
        console.log('cdr-data',data)
    })
});

cdr_websock.onclose = () => {
    console.log("Connection closed");
    agent_websock.close();
};

cdr_websock.onerror = (error) => {
    console.log(error, 'error cdr')
};






