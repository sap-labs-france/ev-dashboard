import { MatDialog } from '@angular/material/dialog';
import { CarCatalogDialogComponent } from 'app/pages/cars/car-catalog/car-catalog.dialog.component';
import { CarButtonAction, CarCatalog } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableViewAction } from './table-view-action';

export class TableViewCarCatalogAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR_CATALOG,
      action: this.viewCarCatalog,
    };
  }

  private viewCarCatalog(carCatalog: CarCatalog, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(CarCatalogDialogComponent, carCatalog, dialog, refresh);
  }
}
