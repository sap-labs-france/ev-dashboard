import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import {
  ChargingStation,
  ChargingStationButtonAction,
  OCPPGeneralResponse,
} from '../../../../types/ChargingStation';
import { ActionResponse } from '../../../../types/DataResult';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableChargingStationsClearCacheActionDef extends TableActionDef {
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

export class TableChargingStationsClearCacheAction implements TableAction {
  private action: TableChargingStationsClearCacheActionDef = {
    id: ChargingStationButtonAction.CLEAR_CACHE,
    type: 'button',
    icon: 'layers_clear',
    color: ButtonActionColor.PRIMARY,
    name: 'chargers.clear_cache_action',
    tooltip: 'general.tooltips.clear_cache',
    action: this.clearCache,
  };

  public getActionDef(): TableChargingStationsClearCacheActionDef {
    return this.action;
  }

  private clearCache(
    chargingStation: ChargingStation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    // Show yes/no dialog
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('chargers.clear_cache_title'),
        translateService.instant('chargers.clear_cache_confirm', {
          chargeBoxID: chargingStation.id,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          // Clear cache
          centralServerService.chargingStationClearCache(chargingStation.id).subscribe({
            next: (response: ActionResponse) => {
              spinnerService.hide();
              if (response.status === OCPPGeneralResponse.ACCEPTED) {
                messageService.showSuccessMessage(
                  translateService.instant('chargers.clear_cache_success', {
                    chargeBoxID: chargingStation.id,
                  })
                );
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  messageService,
                  'chargers.clear_cache_error'
                );
              }
            },
            error: (error: any) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                'chargers.clear_cache_error'
              );
            },
          });
        }
      });
  }
}
