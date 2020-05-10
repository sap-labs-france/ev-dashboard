import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { ChargingStation, ChargingStationButtonAction, OCPPGeneralResponse } from 'app/types/ChargingStation';

import { ActionResponse } from 'app/types/DataResult';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

export class TableChargingStationsClearCacheAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.CLEAR_CACHE,
    type: 'button',
    icon: 'layers_clear',
    color: ButtonColor.PRIMARY,
    name: 'chargers.clear_cache_action',
    tooltip: 'general.tooltips.clear_cache',
    action: this.clearCache,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private clearCache(chargingStation: ChargingStation, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
    refresh?: () => Observable<void>) {
    // Show yes/no dialog
    dialogService.createAndShowYesNoDialog(
      translateService.instant('chargers.clear_cache_title'),
      translateService.instant('chargers.clear_cache_confirm', { chargeBoxID: chargingStation.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        // Clear cache
        centralServerService.chargingStationClearCache(chargingStation.id).subscribe((response: ActionResponse) => {
            spinnerService.hide();
            if (response.status === OCPPGeneralResponse.ACCEPTED) {
              messageService.showSuccessMessage(
                translateService.instant('chargers.clear_cache_success', { chargeBoxID: chargingStation.id }));
              if (refresh) {
                refresh().subscribe();
              }
            } else {
              Utils.handleError(JSON.stringify(response),
                messageService, 'chargers.clear_cache_error');
            }
          }, (error: any) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService,
              centralServerService, 'chargers.clear_cache_error');
          });
        }
    });
  }
}
