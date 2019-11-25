import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MobileType, User } from 'app/common.types';
import { BAD_REQUEST, CONFLICT, FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import { Observable } from 'rxjs';
import { CentralServerService } from '../services/central-server.service';
import { MessageService } from '../services/message.service';

export class Utils {
  public static validateEqual(formGroup: FormGroup, firstField, secondField) {
    const field1: FormControl = formGroup.controls[firstField] as FormControl;
    const field2: FormControl = formGroup.controls[secondField] as FormControl;

    // Null?
    if (!field1.value && !field2.value) {
      return null;
    }
    // Equals
    if (field1.value === field2.value) {
      return null;
    }
    // Not Equal
    return { notEqual: true };
  }

  public static handleError(error, messageService, errorMessage?, params?): Observable<any> {
    console.log(`Error: ${errorMessage}: ${error}`);
    return messageService.showErrorMessage(errorMessage, params);
  }

  public static isInMobileApp(): boolean {
    return Utils.getMobileVendor() !== null;
  }

  public static buildUserFullName(user: User) {
    let fullName: string;
    if (!user || !user.name) {
      return 'Unknown';
    }
    if (user.firstName) {
      fullName = `${user.name}, ${user.firstName}`;
    } else {
      fullName = user.name;
    }
    return fullName;
  }

  public static getMobileVendor(): MobileType {
    let mobileVendor: MobileType = null;
    const userAgent: string = navigator.userAgent as string || navigator.vendor as string || window['opera'] as string;
    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      mobileVendor = MobileType.IOS;
    } else if (userAgent.match(/Android/i)) {
      mobileVendor = MobileType.ANDROID;
    }
    return mobileVendor;
  }

  public static buildMobileAppDeepLink(path: string): string {
    const mobileVendor = Utils.getMobileVendor();
    switch (mobileVendor) {
      case MobileType.IOS:
        return `eMobility://${path}`;
      case MobileType.ANDROID:
        return `intent://${path}#Intent;scheme=eMobility;package=com.emobility;end`;
    }
  }

  public static handleHttpError(error, router: Router, messageService: MessageService,
    centralServerService: CentralServerService, errorMessage: string, params?) {
    // Check error
    switch (error.status) {
      // Server connection error`
      case 0:
        messageService.showErrorMessageConnectionLost();
        if (centralServerService.isAuthenticated()) {
          // Log Off (remove token)
          centralServerService.logoutSucceeded();
        }
        // Login
        router.navigate(['/auth/login']);
        break;

      // Unauthorized!
      case UNAUTHORIZED:
        // Not logged in so redirect to login page with the return url
        router.navigate(['/auth/login']);
        break;
      // Conflict in User Session
      case FORBIDDEN:
        messageService.showWarningMessageUserOrTenantUpdated();
        if (centralServerService.isAuthenticated()) {
          // Log Off (remove token)
          centralServerService.logoutSucceeded();
        }
        router.navigate(['/auth/login']);
        break;
      case BAD_REQUEST:
        messageService.showErrorMessage('general.invalid_content');
        break;

      case CONFLICT:
        if (error.details) {
          messageService.showErrorMessage(error.details.message, error.details.params);
        } else {
          messageService.showErrorMessage(error.message);
        }
        break;

      // Backend issue
      default:
        console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`);
        messageService.showErrorMessage(errorMessage, params);
        break;
    }
  }

  public static convertToDate(date: any) {
    // Check
    if (!date) {
      return date;
    }
    // Check Type
    if (!(date instanceof Date)) {
      return new Date(date);
    }
    return date;
  }

  public static convertToInteger(id: any) {
    let changedID = id;
    if (!id) {
      return 0;
    }
    // Check
    if (typeof id === 'string') {
      // Create Object
      changedID = parseInt(id, 10);
    }
    return changedID;
  }

  public static convertToFloat(id: any) {
    let changedID = id;
    if (!id) {
      return 0;
    }
    // Check
    if (typeof id === 'string') {
      // Create Object
      changedID = parseFloat(id);
    }
    return changedID;
  }

  public static isNull(obj: any) {
    // tslint:disable-next-line: triple-equals
    return obj == null;
  }

  public static copyToClipboard(content: any) {
    const element = document.createElement('textarea');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '0';
    element.value = content;
    document.body.appendChild(element);
    element.focus();
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
  }
}
