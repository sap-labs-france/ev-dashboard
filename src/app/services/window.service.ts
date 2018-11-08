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

  getSubdomain(): string {
    const subdomain = this.getHostname().split(this.configService.getFrontEnd().host)[0];
    return subdomain.split('.')[0];
  }

  getLocalStorage(): Storage {
    return this.window.localStorage;
  }
}
