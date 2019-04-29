import { CanLoad, Route, UrlSegment } from "@angular/router";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable()
export class DevEnvGuard implements CanLoad {
  constructor() {}

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
    return !environment.production; // if prod = false it will load module
  }
}