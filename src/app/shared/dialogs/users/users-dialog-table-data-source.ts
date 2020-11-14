import { CentralServerService } from '../../../services/central-server.service';
import { DataResult } from '../../../types/DataResult';
import { DialogTableDataSource } from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { TableColumnDef } from '../../../types/Table';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class UsersDialogTableDataSource extends DialogTableDataSource<User> {
  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getUsers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
          // Ok
          observer.next(users);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'users.name',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        class: 'text-left col-25p',
      },
      {
        id: 'email',
        name: 'users.email',
        class: 'text-left col-40p',
      },
    ];
  }
}
