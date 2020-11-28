import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { CarButtonAction, CarCatalog } from '../../../../types/Car';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewCarCatalogActionDef extends TableActionDef {
  action: (carCatalogDialogComponent: ComponentType<unknown>, carCatalog: CarCatalog, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewCarCatalogAction extends TableViewAction {
  public getActionDef(): TableViewCarCatalogActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR_CATALOG,
      action: this.viewCarCatalog,
    };
  }

  private viewCarCatalog(carCatalogDialogComponent: ComponentType<unknown>, carCatalog: CarCatalog, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(carCatalogDialogComponent, carCatalog.id, dialog, refresh);
  }
}
