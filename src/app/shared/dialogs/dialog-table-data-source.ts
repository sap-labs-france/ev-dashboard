import { TableDataSource } from '../table/table-data-source';
import { TableDef } from '../../common.types';

export abstract class DialogTableDataSource<T> extends TableDataSource<T> {
    constructor() {
        super();
    }

    getTableDef(): TableDef {
        return {
            class: 'table-dialog-list',
            rowSelection: {
                enabled: true,
                multiple: true
            },
            search: {
                enabled: true
            }
        };
    }

    public getPaginatorPageSizes() {
        return [10, 25, 50];
    }
}
