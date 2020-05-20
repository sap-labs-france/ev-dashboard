import * as io from 'socket.io-client';

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
      });
    } else if (this.socketIO && this.socketIO.disconnected) {
      // Connect Socket IO
      this.socketIO.connect();
    } else {
      // console.log('Missing serverURL and token arguments');
    }
    this.socketIO.on('connect', connectCallback);
    // Temporary debug log
    this.socketIO.on('connect_timeout', (timeout) => { console.log(`SocketIO client connection timeout: ${timeout}`); });
    this.socketIO.on('connect_error', (error) => { console.log(`SocketIO client connect error: ${error}`); });
    this.socketIO.on('reconnecting', (attempt) => { console.log(`SocketIO client #${attempt} try to reconnect`); });
    this.socketIO.on('reconnect_error', (error) => { console.log(`SocketIO client reconnect error: ${error}`); });
  }

  public disconnect() {
    if (this.socketIO) {
      this.socketIO.disconnect();
    }
    this.socketIO = null;
  }
}
