import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {CentralServerService} from '../services/central-server.service';
import {MessageService} from '../services/message.service';
import {Router} from '@angular/router';
import {BAD_REQUEST, CONFLICT, UNAUTHORIZED, FORBIDDEN} from 'http-status-codes';

export class Utils {
  public static validateEqual(formGroup: FormGroup, firstField, secondField) {
    const field1: FormControl = <FormControl>formGroup.controls[firstField];
    const field2: FormControl = <FormControl>formGroup.controls[secondField];

    // Null?
    if (!field1.value && !field2.value) {
      return null;
    }
    // Equals
    if (field1.value === field2.value) {
      return null;
    }
    // Not Equal
    return {notEqual: true};
  }

  public static handleError(error, messageService, errorMessage?): Observable<any> {
    console.log(`Error: ${errorMessage}: ${error}`);
    return messageService.showErrorMessage(errorMessage);
  }

  public static handleHttpError(error, router: Router,
                                messageService: MessageService,
                                centralServerService: CentralServerService,
                                errorMessage: string) {
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
        messageService.showErrorMessage(errorMessage);
        break;
    }
  }

  public static convertToDate(date) {
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

  public static convertToInteger(id) {
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

  public static convertToFloat(id) {
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
}
