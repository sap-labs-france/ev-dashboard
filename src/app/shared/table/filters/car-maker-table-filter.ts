import { CarMakersDialogComponent } from '../../../shared/dialogs/car-makers/car-makers-dialog.component';
import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class CarMakerTableFilter extends TableFilter {
  public constructor(carMakers?: readonly string[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'carMakers',
      httpId: 'CarMaker',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'cars.car_makers',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: CarMakersDialogComponent,
      cleared: true,
    };
    if (carMakers) {
      filterDef.dialogComponentData = {
        staticFilter: {
          carMakers: carMakers.join('|'),
        },
      };
    }
    // Set
    this.setFilterDef(filterDef);
  }
}
