import * as io from 'socket.io-client';

export default class SocketIOClient {
  private static instance: SocketIOClient;
  public socket: SocketIOClient.Socket;

  private constructor() {
  }

  public static getInstance(): SocketIOClient {
    if (!SocketIOClient.instance) {
      SocketIOClient.instance = new SocketIOClient();
    }
    return SocketIOClient.instance;
  }

  public connectAuthenticated(serverURL: string, token: string, connectCallback: () => void = () => { }) {
    // Check
    if (!this.socket && serverURL && token) {
      // Init and connect Socket IO
      this.socket = io(serverURL, {
        query: 'token=' + token,
      });
    } else if (this.socket && this.socket.disconnected) {
      // Connect Socket IO
      this.socket.connect();
    } else {
      // console.log('Missing serverURL and token arguments');
    }
    this.socket.on('connect', connectCallback);
    this.socket.on('disconnect', () => { this.socket.removeAllListeners(); });
    // Temporary debug log
    this.socket.on('connect_timeout', () => { console.log(`SocketIO client connection timeout`); });
    this.socket.on('connect_error', (error) => { console.log(`SocketIO client connect error: ${error}`); });
    this.socket.on('reconnecting', (attempt) => { console.log(`SocketIO client #${attempt} try to reconnect`); });
    this.socket.on('reconnect_error', (error) => { console.log(`SocketIO client reconnect error: ${error}`); });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = null;
  }
}
