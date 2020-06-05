import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult } from 'app/types/DataResult';
import { LogActions } from 'app/types/Log';
import { ServerAction } from 'app/types/Server';
import { TableColumnDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class LogActionsDialogTableDataSource extends DialogTableDataSource<LogActions> {
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

  public loadDataImpl(): Observable<DataResult<LogActions>> {
    return new Observable((observer) => {
      let actions: LogActions[] = [];
      const x = this.getSearchValue();
      debugger;
      // actions = Object.keys(ServerAction).map(key => ServerAction[key]);
      // tslint:disable-next-line: forin
      for (const item in ServerAction) {
        actions.push({
          action: ServerAction[item],
          key: ServerAction[item],
          id: ServerAction[item]
        });
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
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      }
    ];
  }
}
