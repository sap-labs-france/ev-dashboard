import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableSynchronizeAction } from 'app/shared/table/actions/table-synchronize-action';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { RestResponse } from 'app/types/GlobalType';
import { TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export interface TableRetrieveAssetConsumptionActionDef extends TableActionDef {
  action: (asset: Asset, spinnerService: SpinnerService,
    centralServerService: CentralServerService, messageService: MessageService,
    router: Router, refresh?: () => Observable<void>) => void;
}

export class TableRetrieveAssetConsumptionAction extends TableSynchronizeAction {
  public getActionDef(): TableRetrieveAssetConsumptionActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.RETRIEVE_ASSET_CONSUMPTION,
      action: this.tableRetrieveAssetConsumptionAction,
    };
  }

  private tableRetrieveAssetConsumptionAction(asset: Asset, spinnerService: SpinnerService,
    centralServerService: CentralServerService, messageService: MessageService,
    router: Router, refresh?: () => Observable<void>) {
      spinnerService.show();
      centralServerService.tableRetrieveAssetConsumptionAction(asset.id).subscribe((response) => {
        spinnerService.hide();
        if (response.status && response.status === RestResponse.SUCCESS) {
          refresh().subscribe();
          messageService.showSuccessMessage('assets.refresh_success');
        }
      }, (error) => {
        spinnerService.hide();
        Utils.handleHttpError(error, router, messageService, centralServerService,
          'assets.refresh_error');
      });
  }
}
