import {TableDataSource} from '../table/table-data-source';
import {TableDef, TableActionDef} from '../../common.types';
import { SpinnerService } from 'app/services/spinner.service';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class DialogTableDataSource<T> extends TableDataSource<T> {
  constructor(
    public spinnerService: SpinnerService) {
    super(spinnerService);
  }

  buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: false
      },
      search: {
        enabled: true
      }
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [];
  }
}
