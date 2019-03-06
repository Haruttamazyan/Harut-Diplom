import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { AuthWsMiddleware } from '../../middlewares/ws';
import * as redis from 'redis';
import { IConnectionObject } from '../../interfaces/ws';
import { contactsListWsNamespace } from '../../constants';
import { APP_WS_PORT } from '../../config';

@WebSocketGateway({ port: APP_WS_PORT, namespace: contactsListWsNamespace })
export class ContactsListGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly connections: IConnectionObject = {};

  public afterInit (io: any) {
    io.use(AuthWsMiddleware);
  }

  public handleConnection (socket: any) {
    const companyId = socket.user.companyId;
    const userId = socket.user.id;

    process.stdout.write(
      `[contacts-list gateway]: Connection from "${userId}" socket id: "${socket.id}"\n`
    );

    // Company is already in connections object, add user and return.
    if (this.connections[companyId]) {
      this.connections[companyId].userSockets[userId].push(socket);
      return;
    }

    const redisClient = redis.createClient();

    // Create just one redis client per company, and add user.
    this.connections[companyId] = {
      redisClient,
      userSockets: {
        [userId]: [socket]
      }
    };

    redisClient.subscribe(`contacts-list:${companyId}`);

    redisClient.on('message', (ch, message) => {
      Object.keys(this.connections[companyId].userSockets).forEach(socketUserId => {
        this.connections[companyId].userSockets[socketUserId].forEach(s => {
          s.emit('contacts-list-status', {
            ...JSON.parse(message),
            timestamp: Date.now()
          });
        });
      });
    });
  }

  public handleDisconnect (socket: any) {
    const companyId = socket.user.companyId;
    const userId = socket.user.id;
    const company = this.connections[companyId];

    process.stdout.write(
      `[contacts-list gateway]: Disconnection from "${userId}" socket id: "${socket.id}"\n`
    );

    // Only for debugging purposes while correctly implementing sticky sessions
    // to handle sockets in multiple application instances.
    if (
      !company ||
      !company.userSockets[userId] ||
      !company.userSockets[userId].some(s => s.id === socket.id)
    ) {
      process.stderr.write(
        `Connection of user ${userId} of company ${companyId} ` +
        `was not handled by process ${process.pid}.\n`
      );
      return;
    }

    const user = company.userSockets[userId];

    // If only one user is connected, quit redis client and delete the company.
    // Otherwise delete the user.
    if (Object.keys(company.userSockets).length === 1 && user.length === 1) {
      company.redisClient.quit();
      delete this.connections[companyId];
    } else {
      user.splice(user.findIndex(s => s.id === socket.id), 1);
    }
  }
}
