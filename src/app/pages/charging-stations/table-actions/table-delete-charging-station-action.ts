import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { ChargingStation, ChargingStationButtonAction } from 'app/types/ChargingStation';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableDeleteChargingStationAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.DELETE_CHARGING_STATION,
      action: this.deleteChargingStation,
    };
  }

  private deleteChargingStation(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    if (chargingStation.connectors.findIndex((connector) => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.delete_title'),
        translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      super.delete(
        chargingStation, 'chargers.delete_title',
        translateService.instant('chargers.delete_confirm', { chargeBoxID: chargingStation.id }),
        translateService.instant('chargers.delete_success', { chargeBoxID: chargingStation.id }),
        'chargers.delete_error', centralServerService.deleteChargingStation.bind(centralServerService),
        dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
    }
  }
}
