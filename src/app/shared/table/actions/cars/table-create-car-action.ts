import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { CarButtonAction } from '../../../../types/Car';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateCarActionDef extends TableActionDef {
  action: (carDialogComponentcarDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateCarAction extends TableCreateAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.CREATE_CAR,
      action: this.createCar,
    };
  }

  private createCar(carDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(carDialogComponent, dialog, refresh);
  }
}
