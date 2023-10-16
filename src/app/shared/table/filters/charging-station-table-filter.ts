import { FilterType, TableFilterDef } from '../../../types/Table';
import { ChargingStationsDialogComponent } from '../../dialogs/charging-stations/charging-stations-dialog.component';
import { TableFilter } from './table-filter';

export class ChargingStationTableFilter extends TableFilter {
  public constructor(dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'charger',
      httpId: 'ChargingStationID',
      type: FilterType.DIALOG_TABLE,
      label: '',
      name: 'chargers.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: ChargingStationsDialogComponent,
      multiple: true,
      cleared: true,
      dependentFilters,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
