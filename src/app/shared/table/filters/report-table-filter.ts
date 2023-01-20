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
      httpID: 'ReportIDs',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'transactions.reportId',
      dialogComponent: ReportsDialogComponent,
      multiple: true,
      cleared: true,
    };

    // Set
    this.setFilterDef(filterDef);
  }
}
