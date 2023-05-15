import { Inject, Injectable } from '@angular/core';
import { parse } from 'tldts';

import { WINDOW } from '../providers/window.provider';

@Injectable()
export class WindowService {
  // eslint-disable-next-line no-useless-constructor
  public constructor(@Inject(WINDOW) private window: Window) {}

  public getHostname(): string {
    return this.window.location.hostname;
  }

  public getHost(): string {
    return this.window.location.host;
  }

  public getProtocol(): string {
    return this.window.location.protocol;
  }

  public getPath(): string {
    return this.window.location.pathname;
  }

  public getOrigin(): string {
    return this.window.location.origin;
  }

  public getHash(): string {
    return this.window.location.hash.includes('?')
      ? this.window.location.hash.substring(1, this.window.location.hash.indexOf('?'))
      : this.window.location.hash.substring(1);
  }

  public getSubdomain(): string {
    const urlParsed = parse(this.window.location.host);
    return urlParsed.publicSuffix === 'localhost'
      ? urlParsed.domainWithoutSuffix ?? ''
      : urlParsed.subdomain;
  }

  public getLocalStorage(): Storage {
    return this.window.localStorage;
  }

  public rewriteHashUrl(): boolean {
    if (this.window.location.href.includes('/#/')) {
      const rewrittenUrl = this.window.location.href.replace('/#/', '/');
      this.window.location.replace(rewrittenUrl);
      return true;
    }
    return false;
  }

  public redirectToDomain(domain: string, subdomain: string): void {
    this.window.location.href = `https://${subdomain}.${domain}`;
  }

  public setHash(hash: string): void {
    if (this.getHash() !== hash) {
      this.window.history.replaceState({}, '', `${this.getPath()}#${hash}`);
    }
  }

  public getUrlParameterValue(name: string): string {
    let value = '';
    if (window.location.search) {
      value = new URLSearchParams(window.location.search).get(name);
    } else if (window.location.hash) {
      value = new URLSearchParams(
        window.location.hash.slice(this.window.location.hash.indexOf('?'))
      ).get(name);
    }
    return value;
  }

  public getUrlParameterValues(name: string): string[] {
    return new URLSearchParams(window.location.search).getAll(name);
  }

  public appendUrlParameter(name: string, value: string) {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Add
    urlSearchParams.append(name, value);
    // Set it back
    this.setUrlQueryParams(urlSearchParams.toString());
  }

  public setUrlParameter(name: string, value: string): void {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Set
    urlSearchParams.set(name, value);
    // Set it back
    this.setUrlQueryParams(urlSearchParams.toString());
  }

  public deleteUrlParameter(name: string): void {
    // Parse the query string
    const urlSearchParams = new URLSearchParams(window.location.search);
    // Delete
    urlSearchParams.delete(name);
    // Set it back
    this.setUrlQueryParams(urlSearchParams.toString());
  }

  public clearUrlParameter() {
    this.setUrlQueryParams();
  }

  public openUrl(url: string) {
    this.window.open(url, '_blank');
  }

  private setUrlQueryParams(queryParams?: string) {
    // Set the Query params
    if (history.pushState) {
      // Without page reload
      const newURL = `${window.location.protocol}//${window.location.host}${
        window.location.pathname
      }${queryParams ? '?' + queryParams : ''}${window.location.hash}`;
      window.history.pushState({ path: newURL }, '', newURL);
    } else {
      // With page reload
      this.window.location.search = queryParams ? queryParams : '';
    }
  }
}
