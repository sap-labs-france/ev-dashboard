import * as io from 'socket.io-client';

import { Utils } from './Utils';

export default class SocketIOClient {
  private static instance: SocketIOClient;
  private socketIO: SocketIOClient.Socket;

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
      // Init and connect Socket IO
      this.socketIO = io(serverURL, {
        query: 'token=' + token,
        transports: ['websocket'],
      });
    } else if (this.socketIO && this.socketIO.disconnected) {
      // Connect Socket IO
      this.socketIO.connect();
    } else {
      // Utils.consoleDebugLog('Missing serverURL and token arguments');
    }
    this.socketIO.on('unauthorized', (error) => {
      if (error.data.type === 'UnauthorizedError' || error.data.code === 'invalid_token') {
        // Redirect user to login page perhaps?
        Utils.consoleDebugLog('SocketIO client user token has expired');
      }
    });
    this.socketIO.on('connect', () => {
      Utils.consoleDebugLog(`SocketIO client is connected`);
      connectCallback();
    });
    // On reconnection, reset the transports option
    this.socketIO.on('reconnect_attempt', () => {
      this.socketIO.io.opts.transports = ['polling', 'websocket'];
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
