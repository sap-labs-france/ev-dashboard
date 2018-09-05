import { TableAction } from './table-action';
import { TableActionDef } from '../../../common.types';
import { TranslateService } from '@ngx-translate/core';

export class TableRefreshAction implements TableAction {
    constructor(
        private translateService: TranslateService) {
    }

    // Return an action
    getActionDef(): TableActionDef {
        return {
            id: 'refresh',
            type: 'button',
            icon: 'refresh',
            name: this.translateService.instant('general.refresh')
        };
    }
}
