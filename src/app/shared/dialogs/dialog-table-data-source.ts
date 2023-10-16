import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SpinnerService } from '../../services/spinner.service';
import { TableActionDef, TableData, TableDef } from '../../types/Table';
import { TableDataSource } from '../table/table-data-source';

@Injectable()
export abstract class DialogTableDataSource<T extends TableData> extends TableDataSource<T> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService
  ) {
    super(spinnerService, translateService);
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [];
  }
}
