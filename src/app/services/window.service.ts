import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '../providers/window.provider';
import { ConfigService } from './config.service';

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

  getOrigin(): string {
    return this.window.location.origin;
  }

  getHash(): string {
    return this.window.location.hash.substring(1);
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

  setHash(hash: string): void {
    if (this.getHash() !== hash) {
      this.window.history.replaceState({}, '', `${this.getPath()}#${hash}`);
    }
  }

  getSearch(name: string): string {
    // @ts-ignore
    return new URLSearchParams(window.location.search).get(name);
  }

  getSearches(name: string): string[] {
    return new URLSearchParams(window.location.search).getAll(name);
  }

  appendSearch(name: string, value: string) {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Add
    urlSearchParams.append(name, value);
    // Set it back
    this._setSearchQueryParams(urlSearchParams.toString());
  }

  setSearch(name: string, value: string): void {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Set
    urlSearchParams.set(name, value);
    // Set it back
    this._setSearchQueryParams(urlSearchParams.toString());
  }

  deleteSearch(name: string): void {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Delete
    urlSearchParams.delete(name);
    // Set it back
    this._setSearchQueryParams(urlSearchParams.toString());
  }

  clearSearch() {
    this._setSearchQueryParams(null);
  }

  private _setSearchQueryParams(queryParams: string | null) {
    // Set the Query params
    if (history.pushState) {
      // Without page reload
      // tslint:disable-next-line:max-line-length
      const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}${queryParams ? '?' + queryParams : ''}${window.location.hash}`;
      window.history.pushState({path: newURL}, '' , newURL);
    } else {
      // With page reload
      this.window.location.search = queryParams ? queryParams : '';
    }
  }
}
