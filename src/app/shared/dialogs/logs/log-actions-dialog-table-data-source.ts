import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult } from 'app/types/DataResult';
import { LogActions } from 'app/types/Log';
import { ServerAction } from 'app/types/Server';
import { TableColumnDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class LogActionsDialogTableDataSource extends DialogTableDataSource<LogActions> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<LogActions>> {
    return new Observable((observer) => {
      let actions: LogActions[] = [];
      const searchValue = this.getSearchValue().length > 0 ? this.getSearchValue() : '';
      for (const item in ServerAction) {
        if ((ServerAction[item]).toLowerCase().includes(searchValue.toLowerCase())) {
          actions.push({
            action: ServerAction[item],
            key: ServerAction[item],
            id: ServerAction[item]
          });
        }
      }
      actions = actions.sort((n1, n2) => {
        if (n1.action > n2.action) {
          return this.getSort().direction === 'asc' ? 1 : -1;
        }

        if (n1.action < n2.action) {
          return this.getSort().direction === 'asc' ? -1 : 1;
        }
        return 0;
      });
      observer.next({
        count: actions.length,
        result: actions
      });
      observer.complete();
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'action',
        name: 'logs.actions',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      }
    ];
  }
}
