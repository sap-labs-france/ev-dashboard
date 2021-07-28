import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStation, ChargingStationButtonAction, OCPPGeneralResponse } from '../../../../types/ChargingStation';
import { ActionResponse } from '../../../../types/DataResult';
import { ButtonColor, ButtonType, TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableChargingStationsTriggerDataTransferActionDef extends TableActionDef {
  action: (chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
    refresh?: () => Observable<void>) => void;
}

export class TableChargingStationsTriggerDataTransferAction implements TableAction {
  private action: TableChargingStationsTriggerDataTransferActionDef = {
    id: ChargingStationButtonAction.TRIGGER_DATA_TRANSFER,
    type: 'button',
    icon: '360_icon',
    color: ButtonColor.PRIMARY,
    name: 'chargers.trigger_data_transfer_action',
    tooltip: 'general.tooltips.trigger_data_transfer',
    action: this.triggerDataTransfer,
  };

  public getActionDef(): TableChargingStationsTriggerDataTransferActionDef {
    return this.action;
  }

  private triggerDataTransfer(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
    refresh?: () => Observable<void>) {
    spinnerService.show();
    // Trigger data transfer
    centralServerService.chargingStationTriggerDataTransfer(chargingStation.id).subscribe((response: ActionResponse) => {
      spinnerService.hide();
      if (response.status === OCPPGeneralResponse.ACCEPTED) {
        messageService.showSuccessMessage(
          translateService.instant('chargers.trigger_data_transfer_success', { chargeBoxID: chargingStation.id }));
        if (refresh) {
          refresh().subscribe();
        }
      } else {
        Utils.handleError(JSON.stringify(response),
          messageService, 'chargers.trigger_data_transfer_error');
      }
    }, (error: any) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService,
        centralServerService, 'chargers.trigger_data_transfer_error');
    });
  }
}
