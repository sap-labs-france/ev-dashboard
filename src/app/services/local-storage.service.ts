import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class LocalStorageService {
  private _isInIFrame = false;
  private _requestId = 0;
  private _requests = [];

  constructor() {
    // Init
    if (self !== top) {
      this._isInIFrame = true;
    }
    // Register event to listen from the iFrame
    window.addEventListener('message', this._receiveMessage.bind(this), false);
  }

  private _sendRequest(data) {
    // Keep call back
    this._requests[data.request.id] = data.callback;
    // Post
    parent.postMessage(JSON.stringify(data.request), '*');
  }

  private _receiveMessage(event) {
    let data;
    try {
      // Parse the data
      data = JSON.parse(event.data);
    } catch (err) {
      // ignore
    }
    if (data) {
      if (this._requests[data.id]) {
        // Call back
        this._requests[data.id].next(data.value);
        this._requests[data.id].complete();
        // Clear
        delete this._requests[data.id];
      }
    }
  }

  public setItem(key, value) {
    // iFrame?
    if (this._isInIFrame) {
      // Build request
      const data = {
        request: {
          id: this._requestId++,
          type: 'set',
          key: key,
          value: value
        }
      };
      // Send
      this._sendRequest(data);
    } else {
      // Not in iFrame: use it rightaway
      localStorage.setItem(key, value);
    }
  }

  public getItem(key): Observable<any> {
    // Exec
    return new Observable(observer => {
      // iFrame?
      if (this._isInIFrame) {
        const data = {
          request: {
            id: this._requestId++,
            type: 'get',
            key: key
          },
          callback: observer
        };
        // Send request
        this._sendRequest(data);
      } else {
        // Not in iFrame: use it rightaway
        observer.next(localStorage.getItem(key));
        observer.complete();
      }
    });
  }

  public removeItem(key) {
    // iFrame?
    if (this._isInIFrame) {
      const data = {
        request: {
          id: this._requestId++,
          type: 'remove',
          key: key
        }
      };
      // Send request
      this._sendRequest(data);
    } else {
      // Not in iFrame: use it rightaway
      localStorage.removeItem(key);
    }
  }

  public clear() {
    // iFrame?
    if (this._isInIFrame) {
      const data = {
        request: {
          id: this._requestId++,
          type: 'clear'
        }
      };
      // Send request
      this._sendRequest(data);
    } else {
      // Not in iFrame: use it rightaway
      localStorage.clear();
    }
  }
}
