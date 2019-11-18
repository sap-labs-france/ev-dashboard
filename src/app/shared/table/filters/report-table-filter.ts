import { TableFilterDef } from '../../../common.types';
import { UserDialogComponent } from '../../../pages/users/user/user.dialog.component';
import { Constants } from '../../../utils/Constants';
import { ReportsDialogComponent } from '../../dialogs/reports/reports-dialog.component';
import { UsersDialogComponent } from '../../dialogs/users/users-dialog.component';
import { TableFilter } from './table-filter';

// Sort table by reports ID
export class ReportTableFilter extends TableFilter {
  constructor() {
    super();

    // Define filter
    const filterDef: TableFilterDef = {
      id: 'refundData',
      httpId: 'ReportIDs',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'transactions.reportId',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: ReportsDialogComponent,
      multiple: true,
      cleared: true,
    };

    // Set
    this.setFilterDef(filterDef);
  }
}
