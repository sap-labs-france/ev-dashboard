import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HTTPError } from 'types/HTTPError';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { RestResponse } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableSynchronizeAction } from '../table-synchronize-action';

export interface TableRetrieveAssetConsumptionActionDef extends TableActionDef {
  action: (
    asset: Asset,
    spinnerService: SpinnerService,
    centralServerService: CentralServerService,
    messageService: MessageService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableRetrieveAssetConsumptionAction extends TableSynchronizeAction {
  public getActionDef(): TableRetrieveAssetConsumptionActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.RETRIEVE_ASSET_CONSUMPTION,
      action: this.tableRetrieveAssetConsumptionAction,
    };
  }

  private tableRetrieveAssetConsumptionAction(
    asset: Asset,
    spinnerService: SpinnerService,
    centralServerService: CentralServerService,
    messageService: MessageService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    spinnerService.show();
    centralServerService.tableRetrieveAssetConsumptionAction(asset.id).subscribe({
      next: (response) => {
        spinnerService.hide();
        if (response.status && response.status === RestResponse.SUCCESS) {
          refresh().subscribe();
          messageService.showSuccessMessage('assets.refresh_success');
        }
      },
      error: (error) => {
        spinnerService.hide();
        switch (error.status) {
          case HTTPError.CANNOT_RETRIEVE_CONSUMPTION:
            Utils.handleHttpError(
              error,
              router,
              messageService,
              centralServerService,
              'assets.consumption_error'
            );
            break;
          default:
            Utils.handleHttpError(
              error,
              router,
              messageService,
              centralServerService,
              'assets.refresh_error'
            );
            break;
        }
      },
    });
  }
}
