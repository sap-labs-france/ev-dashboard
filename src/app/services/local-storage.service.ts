import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class LocalStorageService {
  private isInIFrame = false;
  private requestId = 0;
  private requests = [];

  public constructor() {
    if (self !== top) {
      this.isInIFrame = true;
    }
    // Register event to listen from the iFrame
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  public setItem(key: string, value: string) {
    if (this.isInIFrame) {
      // Build request
      const data = {
        request: {
          id: this.requestId++,
          type: 'set',
          key,
          value,
        },
      };
      // Send
      this.sendRequest(data);
    } else {
      // Not in iFrame: use it right away
      localStorage.setItem(key, value);
    }
  }

  public getItem(key: string): Observable<any> {
    return new Observable((observer) => {
      if (this.isInIFrame) {
        const data = {
          request: {
            id: this.requestId++,
            type: 'get',
            key,
          },
          callback: observer,
        };
        // Send request
        this.sendRequest(data);
      } else {
        // Not in iFrame: use it right away
        observer.next(localStorage.getItem(key));
        observer.complete();
      }
    });
  }

  public removeItem(key: string) {
    if (this.isInIFrame) {
      const data = {
        request: {
          id: this.requestId++,
          type: 'remove',
          key,
        },
      };
      // Send request
      this.sendRequest(data);
    } else {
      // Not in iFrame: use it right away
      localStorage.removeItem(key);
    }
  }

  public clear() {
    if (this.isInIFrame) {
      const data = {
        request: {
          id: this.requestId++,
          type: 'clear',
        },
      };
      // Send request
      this.sendRequest(data);
    } else {
      // Not in iFrame: use it right away
      localStorage.clear();
    }
  }

  private sendRequest(data: any) {
    // Keep call back
    this.requests[data.request.id] = data.callback;
    // Post
    parent.postMessage(JSON.stringify(data.request), '*');
  }

  private receiveMessage(event: any) {
    let data;
    try {
      // Parse the data
      data = JSON.parse(event.data);
    } catch (err) {
      // ignore
    }
    if (data) {
      if (this.requests[data.id]) {
        // Call back
        this.requests[data.id].next(data.value);
        this.requests[data.id].complete();
        // Clear
        delete this.requests[data.id];
      }
    }
  }
}
