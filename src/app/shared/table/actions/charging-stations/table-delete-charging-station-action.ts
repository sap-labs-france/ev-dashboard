import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStation, ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteChargingStationActionDef extends TableActionDef {
  action: (
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteChargingStationAction extends TableDeleteAction {
  public getActionDef(): TableDeleteChargingStationActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.DELETE_CHARGING_STATION,
      action: this.deleteChargingStation,
    };
  }

  private deleteChargingStation(
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    if (
      chargingStation.connectors.findIndex((connector) => connector.currentTransactionID > 0) >= 0
    ) {
      // Do not delete when active transaction on going
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.delete_title'),
        translateService.instant('chargers.action_error.delete_active_transaction')
      );
    } else {
      super.delete(
        chargingStation,
        'chargers.delete_title',
        translateService.instant('chargers.delete_confirm', { chargeBoxID: chargingStation.id }),
        translateService.instant('chargers.delete_success', { chargeBoxID: chargingStation.id }),
        'chargers.delete_error',
        centralServerService.deleteChargingStation.bind(centralServerService),
        dialogService,
        translateService,
        messageService,
        centralServerService,
        spinnerService,
        router,
        refresh
      );
    }
  }
}
