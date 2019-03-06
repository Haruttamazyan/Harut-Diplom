const WebSocket = require('html5-websocket');
//import * as WebSocket from 'html5-websocket'
import { NODE_ENV, AGENT_WS_PORT, APP_WS_PORT, DNL_HOST } from '../../config'
//import { JWT_KEY, JWT_ID, JWT_EXPIRATION, JWT_ALGORITHM } from '../config';
module.exports = (app:any) => {
    let host = NODE_ENV === 'development'? '127.0.0.1': DNL_HOST;
    console.log('host-->',host)
    console.log('port-->', APP_WS_PORT)
    console.log('connection-->',`ws://${host}:54321/`)
const agent_websock = new WebSocket(`ws://${host}:54321/`);
//let io = require('../connection/agent')();
let ws_helper = require('../helper');

var express = require('express');
var http = require('http');


var app = express();

let httpsServer = http.createServer(app);

let io = require('socket.io')(httpsServer);

httpsServer.listen(AGENT_WS_PORT, async () => {
    console.log(`Successful agent ws server connection on ${AGENT_WS_PORT}`);
});

io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        await ws_helper.jwtParserPromiseCallback(socket.handshake.query.token);
        return next()
    } else {
        return next(new Error('Authentication error'))
    }
})
    .on('connection', (socket) => {
        return socket
    });

const ws_type = {
    WS_LISTEN: 0,
    WS_AGENT: 1,
    WS_EVENT: 2,
    WS_CDR: 3,
    WS_UNKNOWN: 99
};

const event_type = {
    AGENT_REGISTERED: 0,
    AGNET_UNREGISTERED: 1,
    AGENT_PAUSED: 2,
    AGENT_UNPAUSED: 3,
    AGENT_CALLED: 4,
    AGENT_ANSWERED: 5,
    LEAD_CALLED: 6,
    LEAD_RINGING: 7,
    LEAD_ANSWERED: 8,
    LEAD_BRIDGED: 9,
    LEAD_HANGUP: 10,
    LEAD_NOANSWER: 11
};

    try {
        agent_websock.onopen = () => {
            let reg = '{ "ws_type": ' + ws_type.WS_AGENT + '}';
            console.log("Connected to agent _ws");
            agent_websock.send(reg);
        };

        agent_websock.onclose = () => {
            console.log("Connection closed");
            agent_websock.close();
        };

        agent_websock.onerror = (error:any) => {
            console.log(error, 'error')
        };

        agent_websock.onmessage = async (m) => {
            let msg = JSON.parse(m.data);
            console.log( 'msg-agent-->',msg)
            io.emit('test',msg)
            if(msg.campaign_uuid != undefined){
                let campaign_uuid = msg.campaign_uuid.slice(0, 36);
                console.log('sgent1-->',campaign_uuid)
                let campaignEntity = await ws_helper.campaign(campaign_uuid);
                console.log('agent--qwewra',campaignEntity.id)
                console.log('sgentmsggg->',event_type[msg.event])
                if ( event_type[msg.event] >= 4 && event_type[msg.event] <= 13) {
                io.emit(`admin_agent_${campaignEntity.company_id}`, msg);
                if (msg.agent_url && msg.campaign_uuid) {
                    let sip_username = await ws_helper.getSipUsernameFromAgentUrl(msg.agent_url);
                    let agent_uuid = await ws_helper.getAgentByAgentUrl(sip_username, campaignEntity.company_id);
                    msg.batch_uuid = await ws_helper.getContactListByConnectedToAgentUuid(msg.batch_uuid.slice(0, 36), campaignEntity.company_id);
                    msg.campaign_uuid = campaignEntity.campaign_uuid;
                    io.emit(`agent_${agent_uuid}`, msg);
                }
            }
        }
        };
    } catch (err) {
        console.log(err, 'err')
    }

};


