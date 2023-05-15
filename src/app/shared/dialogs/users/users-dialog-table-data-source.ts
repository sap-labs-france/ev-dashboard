import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef } from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class UsersDialogTableDataSource extends DialogTableDataSource<User> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      this.centralServerService
        .getUsers(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (users) => {
            observer.next(users);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
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
