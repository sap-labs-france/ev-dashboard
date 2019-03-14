import {Inject, Injectable} from '@angular/core';
import {WINDOW} from '../providers/window.provider';
import {ConfigService} from './config.service';

@Injectable()
export class WindowService {

  constructor(@Inject(WINDOW) private window: Window, private configService: ConfigService) {
  }

  getHostname(): string {
    return this.window.location.hostname;
  }

  getHost(): string {
    return this.window.location.host;
  }

  getProtocol(): string {
    return this.window.location.protocol;
  }

  getPath(): string {
    return this.window.location.pathname;
  }

  getHash(): string {
    return this.window.location.hash;
  }

  getSubdomain(): string {
    const subdomain = this.getHostname().split(this.configService.getFrontEnd().host)[0];
    return subdomain.split('.')[0];
  }

  getLocalStorage(): Storage {
    return this.window.localStorage;
  }

  rewriteHashUrl(): boolean {
    if (this.window.location.href.includes('/#/')) {
      const rewrittenUrl = this.window.location.href.replace('/#/', '/');
      this.window.location.replace(rewrittenUrl);
      return true;
    }
    return false;
  }

  setHash(hash): void {
    if (this.window.location.hash.substring(1) !== hash) {
      this.window.location.hash = hash;
    }
  }
}
