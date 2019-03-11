import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

export class CustomRouteStrategy implements RouteReuseStrategy {

  private handlers: { [key: string]: DetachedRouteHandle } = {};


  constructor() {

  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    console.warn(`should detach ${route.url.join('/')}`);
    console.warn(route);
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    console.warn(`store ${route.url.join('/')}`);
    console.warn(route);
    if (route.url) {
      this.handlers[route.url.join('/') || route.parent.url.join('/')] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    console.warn(`should attach ${route.url.join('/')}`);
    console.warn(route);
    if (!route.url) {
      return false;
    }
    return !!this.handlers[route.url.join('/')];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    console.warn(`retrieve ${route.url.join('/')}`);
    console.warn(route);
    return this.handlers[route.url.join('/') || route.parent.url.join('/')];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    console.warn(`should reuse future ${future.routeConfig === current.routeConfig}`);
    console.warn(future.routeConfig);
    console.warn(current.routeConfig);
    return future.routeConfig === current.routeConfig;
  }

}
