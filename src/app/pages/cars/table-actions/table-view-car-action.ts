import { MatDialog } from '@angular/material/dialog';
import { CarDialogComponent } from 'app/pages/cars/car/car.dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Car, CarButtonAction } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableViewCarAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR,
      action: this.viewCar,
    };
  }

  private viewCar(car: Car, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(CarDialogComponent, car, dialog, refresh);
  }
}
