import {TableDataSource} from '../table/table-data-source';
import {TableDef} from '../../common.types';

export abstract class DialogTableDataSource<T> extends TableDataSource<T> {
  constructor() {
    super();
  }

  getTableDef(): TableDef {
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

  public getPaginatorPageSizes() {
    return [25, 50, 100];
  }
}
