import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { LogAction } from '../../../types/Log';
import { ServerAction } from '../../../types/Server';
import { TableColumnDef } from '../../../types/Table';
import { LOG_ACTIONS } from '../../model/logs.model';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class LogActionsDialogTableDataSource extends DialogTableDataSource<LogAction> {
  private reversed = false;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService
  ) {
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
        LOG_ACTIONS.reverse();
        this.reversed = true;
      } else if (this.getSort().direction === 'asc' && this.reversed) {
        LOG_ACTIONS.reverse();
        this.reversed = false;
      }
      const selectedRowsActions = this.getSelectedRows().map((value) =>
        value.action.toString().toLowerCase()
      );
      for (const [key, value] of Object.entries(LOG_ACTIONS)) {
        const actionValue = value.value.toLowerCase();
        if (
          actionValue.includes(searchValue.toLowerCase()) ||
          selectedRowsActions.includes(actionValue)
        ) {
          actions.push({
            action: value.value as ServerAction,
            key: value.key,
            id: value.key,
          });
        }
      }
      observer.next({
        count: actions.length,
        result: actions,
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
        sortable: true,
      },
    ];
  }
}
