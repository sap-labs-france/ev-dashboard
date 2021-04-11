import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData } from 'types/Authorization';

import { CarButtonAction } from '../../../../types/Car';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewCarCatalogActionDef extends TableActionDef {
  action: (carCatalogDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    data: DialogData, refresh?: () => Observable<void>) => void;
}

export class TableViewCarCatalogAction extends TableViewAction {
  public getActionDef(): TableViewCarCatalogActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR_CATALOG,
      action: this.viewCarCatalog,
    };
  }

  private viewCarCatalog(carCatalogDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    data: DialogData, refresh?: () => Observable<void>) {
    super.view(carCatalogDialogComponent, dialog, data, refresh);
  }
}
