import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { CarsAuthorizations, DialogParamsWithAuth } from '../../../../types/Authorization';
import { Car, CarButtonAction } from '../../../../types/Car';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditCarActionDef extends TableActionDef {
  action: (
    carDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Car, CarsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditCarAction extends TableEditAction {
  public getActionDef(): TableEditCarActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.EDIT_CAR,
      action: this.editCar,
    };
  }

  private editCar(
    carDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Car, CarsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(carDialogComponent, dialog, dialogParams, refresh);
  }
}
