import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { Car, CarButtonAction } from 'app/types/Car';
import { TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export interface TableDeleteCarActionDef extends TableActionDef {
  action: (car: Car, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableDeleteCarAction extends TableDeleteAction {
  public getActionDef(): TableDeleteCarActionDef {
    return {
      ...super.getActionDef(),
      id: CarButtonAction.DELETE_CAR,
      action: this.deleteCar,
    };
  }

  private deleteCar(car: Car, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      car, 'cars.delete_title',
      translateService.instant('cars.delete_confirm', { carName: Utils.buildCarCatalogName(car.carCatalog) }),
      translateService.instant('cars.delete_success', { carName: Utils.buildCarCatalogName(car.carCatalog) }),
      'cars.delete_error',
      centralServerService.deleteCar.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
