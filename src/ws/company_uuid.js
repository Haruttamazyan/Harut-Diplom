let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OTIyM2RkLWJhY2EtNGQ5OC05Mjk2LWVhMGMzM2YzZmEzNSIsInJvbGUiOiJjb21wYW55LWFkbWluIiwiY29tcGFueUlkIjoiOTVmNzI0ZmEtOTAwYS00NTNkLWFmYWEtYzk5OTJmNTAxYWNiIiwiaWF0IjoxNTQ5NDYxNjcyLCJleHAiOjE1NDk2MzQ0NzIsImp0aSI6ImVkLXYyLWp3dC1pZCJ9.3mcwbwpO2gaKibV512j3nWR6DflqFjazCC5uxq93jeA';
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
let event_websock = io.connect('http://localhost:10000', {
    query: {token: token},
    secure: true,
    rejectUnauthorized: false
});


let company_uuid = 'a42e93d5-3d9a-469a-be91-3b5646090860';

agent_websock.on('connect', function () {
    console.log('admin_agent');
    agent_websock.on(`admin_agent_${company_uuid}`, (data) => {
        console.log( 'agent-data--->', data)
    })
});
event_websock.on('connect', function () {
    console.log('admin_event')
    event_websock.on(`admin_event_${company_uuid}`, (data) => {
        console.log('event-data--->',data )
    });
});

cdr_websock.on('connect', function () {
    console.log('admin_cdr')
    cdr_websock.on(`admin_cdr_${company_uuid}`, (data) => {
        console.log('cdr-data',data)
    })
});
