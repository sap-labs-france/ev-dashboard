import { Clipboard } from '@angular/cdk/clipboard';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { parse } from 'tldts';
import { Utils } from 'utils/Utils';

import { WINDOW } from '../providers/window.provider';

@Injectable()
export class WindowService {
  private filterbarVisible!: boolean;
  private filterbarVisibleSubject = new BehaviorSubject<boolean>(this.filterbarVisible);

  public constructor(
    @Inject(WINDOW) private window: Window,
    private clipboard: Clipboard,
  ) {
    this.filterbarVisible = !Utils.isMobile();
    this.filterbarVisibleSubject.next(this.filterbarVisible);
  }

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
    return this.window.location.hash.includes('?') ? this.window.location.hash.substring(1, this.window.location.hash.indexOf('?')) :
      this.window.location.hash.substring(1);
  }

  public getSubdomain(): string {
    const urlParsed = parse(this.window.location.host);
    return urlParsed.publicSuffix === 'localhost' ? urlParsed.domainWithoutSuffix ?? '' : urlParsed.subdomain;
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

  public getFilterbarVisibleSubject(): BehaviorSubject<boolean> {
    return this.filterbarVisibleSubject;
  }

  public setFilterbarVisible(filtersVisible: boolean) {
    this.filterbarVisible = filtersVisible;
    this.filterbarVisibleSubject.next(this.filterbarVisible);
  }

  public isFilterbarVisible(): boolean {
    return this.filterbarVisible;
  }

  public getUrlParameterValue(name: string): string {
    let value = null;
    if (window.location.search) {
      value = new URLSearchParams(window.location.search).get(name);
    } else if (window.location.hash) {
      value = new URLSearchParams(window.location.hash.slice(this.window.location.hash.indexOf('?'))).get(name);
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

  public buildFullUrl(relativeUrl: string) {
    return `${this.window.location.protocol}//${this.window.location.host}${!relativeUrl.startsWith('/') ? '/' : ''}${relativeUrl}`;
  }

  public openUrl(url: string) {
    this.window.open(url, '_blank');
  }

  public copyToClipboard(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  private setUrlQueryParams(queryParams?: string) {
    // Set the Query params
    if (history.pushState) {
      // Without page reload
      const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}${queryParams ? '?' + queryParams : ''}${window.location.hash}`;
      window.history.pushState({ path: newURL }, '', newURL);
    } else {
      // With page reload
      this.window.location.search = queryParams ? queryParams : '';
    }
  }
}
