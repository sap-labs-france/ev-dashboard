import { TableAction } from './table-action';
import { TableActionDef } from '../../../common.types';
import { TranslateService } from '@ngx-translate/core';

export class TableAutoRefreshAction implements TableAction {
    private action: TableActionDef = {
        id: 'auto-refresh',
        type: 'slide',
        currentValue: true,
        name: this.translateService.instant('general.auto_refresh')
    };

    constructor(
            private translateService: TranslateService,
            private defaultValue: boolean = false) {
        // Set
        this.action.currentValue = defaultValue;
    }

    // Return an action
    getActionDef(): TableActionDef {
        return this.action;
    }
}
