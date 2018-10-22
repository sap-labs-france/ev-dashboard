import { TableAction } from './table-action';
import { TableActionDef } from '../../../common.types';
import { TranslateService } from '@ngx-translate/core';

export class TableDeleteAction implements TableAction {
    private action: TableActionDef = {
        id: 'delete',
        type: 'button',
        icon: 'delete',
        class: 'btn-danger',
        name: this.translateService.instant('general.delete')
    }

    constructor(
        private translateService: TranslateService) {
    }

    // Return an action
    public getActionDef(): TableActionDef {
        return this.action;
    }
}
