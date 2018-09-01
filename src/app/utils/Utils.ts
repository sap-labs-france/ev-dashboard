import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl } from '@angular/forms';
import { CentralServerService } from '../service/central-server.service';
import { MessageService } from '../service/message.service';
import { Router } from '@angular/router';

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
    return { notEqual: true };
  }

  static handleError(error, messageService, errorMessage?): Observable<any> {
    console.log(`Error: ${errorMessage}: ${error}`);
    return messageService.showErrorMessage(errorMessage);
  }

  static handleHttpError(error, router: Router,
      messageService: MessageService,
      centralServerService: CentralServerService,
      errorMessage) {
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
      case 401:
        // Not logged in so redirect to login page with the return url
        router.navigate(['/auth/login']);
        break;

      // Backend issue
      default:
        console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`);
        messageService.showErrorMessage(errorMessage);
        break;
    }
  }

  static convertToDate(date) {
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

  static convertToInteger(id) {
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

  static convertToFloat(id) {
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
