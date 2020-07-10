import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { logActions } from 'app/pages/logs/model/logs.model';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult } from 'app/types/DataResult';
import { LogAction } from 'app/types/Log';
import { ServerAction } from 'app/types/Server';
import { TableColumnDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class LogActionsDialogTableDataSource extends DialogTableDataSource<LogAction> {
  private reversed = false;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<LogAction>> {
    return new Observable((observer) => {
      const actions: LogAction[] = [];
      const searchValue = this.getSearchValue();
      // let reversed = false;
      if (this.getSort().direction === 'desc' && !this.reversed) {
        logActions.reverse();
        this.reversed = true;
      } else if (this.getSort().direction === 'asc' && this.reversed) {
        logActions.reverse();
        this.reversed = false;
      }
      // const sortedActions = this.getSort().direction === 'desc' && !reversed ? logActions.reverse() : logActions;
      for (const [key, value] of Object.entries(logActions)) {
        if (value.value.toLowerCase().includes(searchValue.toLowerCase())) {
          actions.push({
            action: value.value as ServerAction,
            key: value.key,
            id: value.key
          });
        }
      }
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
        class: 'text-left col-80p',
        sorted: true,
        direction: 'asc',
        sortable: true
      }
    ];
  }
}
