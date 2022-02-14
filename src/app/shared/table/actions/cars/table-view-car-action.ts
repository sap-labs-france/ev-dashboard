import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { Car, CarButtonAction } from '../../../../types/Car';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewCarActionDef extends TableActionDef {
  action: (carDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Car>, refresh?: () => Observable<void>) => void;
}

export class TableViewCarAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR,
      action: this.viewCar,
    };
  }

  private viewCar(carDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Car>, refresh?: () => Observable<void>) {
    super.view(carDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.XXXL,
      maxWidth: ScreenSize.XXXL,
      width: ScreenSize.XXXL,
      minHeight: ScreenSize.M,
      maxHeight: ScreenSize.M,
      height: ScreenSize.M
    });
  }
}
