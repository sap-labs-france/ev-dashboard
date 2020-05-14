import { MatDialog } from '@angular/material/dialog';
import { CarCatalogDialogComponent } from 'app/pages/cars/car-catalog/car-catalog.dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { CarButtonAction, CarCatalog } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableViewCarCatalogAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.VIEW_CAR_CATALOG,
      action: this.viewCarCatalog,
    };
  }

  private viewCarCatalog(carCatalog: CarCatalog, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(CarCatalogDialogComponent, carCatalog.id, dialog, refresh);
  }
}
