import { FilterType, TableFilterDef } from 'app/types/Table';

import { ChargersDialogComponent } from '../../dialogs/chargers/chargers-dialog.component';
import { TableFilter } from './table-filter';

export class ChargePlanTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'charger',
      httpId: 'ChargeBoxID',
      type: FilterType.DIALOG_TABLE,
      label: '',
      defaultValue: 'general.all',
      name: 'chargers.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: ChargersDialogComponent,
      multiple: true,
      cleared: true,
    };

    // Set
    this.setFilterDef(filterDef);
  }
}
