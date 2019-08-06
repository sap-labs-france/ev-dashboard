import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { ChargersDialogComponent } from '../../dialogs/chargers/chargers-dialog-component';
import { TableFilter } from './table-filter';

export class ChargerTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'charger',
      httpId: 'ChargeBoxID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      label:'',
      defaultValue: 'general.all',
      name: 'chargers.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: ChargersDialogComponent,
      multiple: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
