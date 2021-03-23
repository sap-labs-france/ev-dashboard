import { FilterType, TableFilterDef } from '../../../types/Table';
import { ReportsDialogComponent } from '../../dialogs/reports/reports-dialog.component';
import { TableFilter } from './table-filter';

// Sort table by reports ID
export class ReportTableFilter extends TableFilter {
  public constructor() {
    super();

    // Define filter
    const filterDef: TableFilterDef = {
      id: 'refundData',
      httpId: 'ReportIDs',
      type: FilterType.DIALOG_TABLE,
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
