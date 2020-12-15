import { Manager, Socket } from 'socket.io-client';

import { Utils } from './Utils';

export default class SocketIOClient {
  private static instance: SocketIOClient;
  private socketIO: Socket;

  private constructor() {
  }

  public get socket() {
    if (this.socketIO) {
      return this.socketIO;
    }
    return null;
  }

  public static getInstance(): SocketIOClient {
    if (!SocketIOClient.instance) {
      SocketIOClient.instance = new SocketIOClient();
    }
    return SocketIOClient.instance;
  }

  public connectAuthenticated(serverURL: string, token: string, connectCallback: () => void = () => { }) {
    // Check
    if (!this.socketIO && serverURL && token) {
      // Init and connect Socket IO client
      const manager = new Manager(serverURL, {
        query: 'auth_token=' + token,
        transports: ['websocket'],
      });
      this.socketIO = manager.socket('/');
    } else if (this.socketIO?.disconnected) {
      // Connect Socket IO
      this.socketIO.connect();
    } else {
      Utils.consoleDebugLog('SocketIO client connection: missing serverURL and token arguments');
    }
    this.socketIO.on('connect', () => {
      Utils.consoleDebugLog(`SocketIO client is connected`);
      connectCallback();
    });
    this.socketIO.on('authenticated', (data) => {
      Utils.consoleDebugLog(data?.message);
    });
    this.socketIO.on('connect_timeout', (timeout) => { Utils.consoleDebugLog(`SocketIO client connection timeout: ${timeout}`); });
    this.socketIO.on('connect_error', (error) => { Utils.consoleDebugLog(`SocketIO client connect error: ${error}`); });
    this.socketIO.on('reconnecting', (attempt) => { Utils.consoleDebugLog(`SocketIO client #${attempt} try to reconnect`); });
    this.socketIO.on('reconnect_error', (error) => { Utils.consoleDebugLog(`SocketIO client reconnect error: ${error}`); });
  }

  public disconnect() {
    if (this.socketIO) {
      this.socketIO.disconnect();
    }
    this.socketIO = null;
  }
}
