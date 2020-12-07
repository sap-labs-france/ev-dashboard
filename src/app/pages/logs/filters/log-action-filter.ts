import { LOG_ACTIONSDialogComponent } from '../../../shared/dialogs/logs/log-actions-dialog.component';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogActionTableFilter extends TableFilter {
  constructor(actions?: ReadonlyArray<string>) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'action',
      httpId: 'Action',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'logs.actions',
      class: 'col-md-6 col-lg-4 col-xl-2',
      dialogComponent: LOG_ACTIONSDialogComponent,
      multiple: true,
      cleared: true,
    };

    if (actions) {
      filterDef.dialogComponentData = {
        staticFilter: {
          Action: actions.join('|'),
        },
      };
    }
    // Set
    this.setFilterDef(filterDef);
  }
}
