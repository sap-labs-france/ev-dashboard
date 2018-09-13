import { TableAction } from './table-action';
import { TableActionDef } from '../../../common.types';
import { TranslateService } from '@ngx-translate/core';

export class TableRemoveAction implements TableAction {
    private action: TableActionDef = {
        id: 'remove',
        type: 'button',
        icon: 'remove',
        class: 'btn-danger',
        name: this.translateService.instant('general.remove')
    }

    constructor(
        private translateService: TranslateService) {
    }

    // Return an action
    getActionDef(): TableActionDef {
        return this.action;
    }
}
