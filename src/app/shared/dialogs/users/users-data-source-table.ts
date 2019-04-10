import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableColumnDef, User} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class UsersDataSource extends DialogTableDataSource<User> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService,
      private spinnerService: SpinnerService) {
    super();
    // Init
    this.initDataSource();
  }

 public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Show spinner
      this.spinnerService.show();
      // Get data
      this.centralServerService.getUsers(this.buildFilterValues(),
        this.buildPaging(), this.buildOrdering()).subscribe((users) => {
          // Hide spinner
          this.spinnerService.hide();
          // Set number of records
          this.setNumberOfRecords(users.count);
          // Update page length (number of sites is in User)
          this.updatePaginator();
          // Ok
          observer.next(users.result);
          observer.complete();
        }, (error) => {
          // Hide spinner
          this.spinnerService.hide();
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'users.name',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        class: 'text-left col-25p'
      },
      {
        id: 'email',
        name: 'users.email',
        class: 'text-left col-40p'
      }
    ];
  }
}
