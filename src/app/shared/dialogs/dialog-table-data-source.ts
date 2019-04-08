import {TableDataSource} from '../table/table-data-source';
import {TableDef, TableActionDef} from '../../common.types';

export abstract class DialogTableDataSource<T> extends TableDataSource<T> {
  constructor() {
    super();
    // Init
    this.initDataSource();
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

  public getTableActionsDef(): TableActionDef[] {
    return [];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 200];
  }
}
