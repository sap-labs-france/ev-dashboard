import { Car, CarButtonAction } from 'app/types/Car';

import { CarDialogComponent } from 'app/pages/cars/car/car.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableViewAction } from './table-view-action';

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
