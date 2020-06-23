import { MatDialog } from '@angular/material/dialog';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { Car, CarButtonAction } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { CarDialogComponent } from '../car/car.dialog.component';

export class TableEditCarAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.EDIT_CAR,
      action: this.editCar,
    };
  }

  private editCar(car: Car, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(CarDialogComponent, car, dialog, refresh);
  }
}
