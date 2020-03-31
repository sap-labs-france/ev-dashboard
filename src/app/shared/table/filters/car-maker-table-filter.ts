import { CarConstructorsDialogComponent } from 'app/shared/dialogs/car/car-constructors-dialog.component';
import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from './table-filter';

export class CarConstructorTableFilter extends TableFilter {
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
      dialogComponent: CarConstructorsDialogComponent,
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
