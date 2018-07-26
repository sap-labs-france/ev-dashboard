import { Observable } from 'rxjs/Observable';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';

export class Utils {
  static showFullScreenOverlay() {
    setTimeout(() => {
      // Click the control
      document.getElementById('fullScreenImageLink').click();
      // Set the margin of the main element
      const lightBoxElem = document.getElementsByClassName('ui-lightbox')[0];
      lightBoxElem['style']['margin-left'] = '-10px';
      // Set the overlay to foreground + transparent background
      const overlayElem = document.getElementsByClassName('ui-dialog-mask')[0];
      overlayElem['style']['background'] = 'transparent';
      overlayElem['style']['z-index'] = 999999999999999;
      // Set the image background transparent
      const backgroundImageElem = document.getElementsByClassName('ui-lightbox-content')[0];
      backgroundImageElem['style']['background'] = 'transparent';
    }, 100);
  }

  static hideFullScreenOverlay() {
    const overlayElem = document.getElementsByClassName('ui-dialog-mask')[0];
    // Found?
    if (overlayElem) {
      // Remove
      overlayElem.remove();
    }
  }

  // Update`
  static updateJSon(source, dest) {
    let i;
    // Browse each props
    for (const property in source) {
      // Array?
      if (Array.isArray(source[property])) {
        // Handle update of array
        for (i = 0; i < source[property].length; i++) {
          // Check
          if (!dest[property][i]) {
            // Init
            dest[property][i] = {};
          }
          // Call recursive
          Utils.updateJSon(source[property][i], dest[property][i]);
        }

        // Handle removal in dest
        const foundElems = [];
        for (i = 0; i < dest[property].length; i++) {
          // Check
          if (!source[property][i]) {
            // Keep index
            foundElems.push(i);
          }
        }
        // Remove by descending to avoid messing up the indexes
        for (i = foundElems.length - 1; i >= 0; i--) {
          // Remove
          dest[property].splice(foundElems[i], 1);
        }
      } else {
        // Update the property
        dest[property] = source[property];
      }
    }
  }

  static removeObjectNotInNewList(currentObjects, newObjects) {
    // Remove Site Areas by descending to avoid messing up the indexes
    for (let i = currentObjects.length - 1; i >= 0; i--) {
      // Current
      const foundNewObject = newObjects.find((newObject) => {
        return (newObject.id === currentObjects[i].id);
      });
      // Found?
      if (!foundNewObject) {
        // No, Remove it
        currentObjects.splice(i, 1);
      }
    }
  }

  static handleError(error, router, messageService, errorMessage?): Observable<any> {
    console.log(`Error: ${errorMessage}: ${error}`);
    return messageService.showErrorMessage(errorMessage);
  }

  static handleHttpError(error, router, messageService, errorMessage): Observable<any> {
    // Check error
    switch (error.status) {
      // Server connection error`
      case 0:
        return messageService.showErrorMessageConnectionLost();

      // Unauthorized!
      case 401:
        // Not logged in so redirect to login page with the return url
        router.navigate(['/auth/login']);
        break;

      // Backend issue
      default:
        console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`);
        return messageService.showErrorMessage(errorMessage);
    }
  }

  static getUrlWithoutQueryString(url) {
    let urlWithoutQueryString;
    const queryStringIndex = url.indexOf('?');

    if (queryStringIndex >= 0) {
      urlWithoutQueryString = url.substring(0, queryStringIndex);
    } else {
      urlWithoutQueryString = url;
    }
    return urlWithoutQueryString;
  }

  static navTo(path: any[], router: Router, route: ActivatedRoute) {
    const navigationExtras: NavigationExtras = {};
    const navFrom = route.snapshot.queryParams['from'];

    if (navFrom) {
      // Array?
      if (Array.isArray(navFrom)) {
        navFrom.push(router.url);
        navigationExtras.queryParams = { 'from': navFrom };
      } else {
        navigationExtras.queryParams = { 'from': [navFrom, router.url] };
      }
    } else {
      navigationExtras.queryParams = { 'from': router.url };
    }
    // Navigate
    router.navigate(path, navigationExtras);
  }

  static navBack(router: Router, route: ActivatedRoute) {
    const navFrom = route.snapshot.queryParams['from'];
    let navBackFrom;

    // Array?
    if (Array.isArray(navFrom)) {
      navBackFrom = navFrom.splice(navFrom.length - 1, 1)[0];
    } else {
      navBackFrom = navFrom;
    }
    router.navigateByUrl(navBackFrom);
  }
}
