import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { CarButtonAction, Car } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { MatDialog } from '@angular/material/dialog';
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
