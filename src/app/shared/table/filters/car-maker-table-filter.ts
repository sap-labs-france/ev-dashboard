import { CarMakersDialogComponent } from 'app/shared/dialogs/car/car-makers-dialog.component';
import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from './table-filter';

export class CarMakerTableFilter extends TableFilter {
  constructor(carConstructors?: ReadonlyArray<string>) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'carConstructors',
      httpId: 'VehicleMake',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'cars.car_constructors',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: CarMakersDialogComponent,
      cleared: true,
    };

    if (carConstructors) {
      filterDef.dialogComponentData = {
        staticFilter: {
          carConstructor: carConstructors.join('|'),
        },
      };
    }
    // Set
    this.setFilterDef(filterDef);
  }
}
