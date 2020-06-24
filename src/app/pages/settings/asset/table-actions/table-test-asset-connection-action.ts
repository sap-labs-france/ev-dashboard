import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableTestConnectionAction } from 'app/shared/table/actions/table-test-connection-action';
import { AssetButtonAction } from 'app/types/Asset';
import { RestResponse } from 'app/types/GlobalType';
import { AssetConnectionSetting } from 'app/types/Setting';
import { TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';

export class TableTestAssetConnectionAction extends TableTestConnectionAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.TEST_ASSET_CONNECTION,
      action: this.testConnection,
    };
  }

  private testConnection(assetConnection: AssetConnectionSetting, spinnerService: SpinnerService,
    centralServerService: CentralServerService, messageService: MessageService, router: Router) {
    spinnerService.show();
    centralServerService.checkAssetConnection(assetConnection.id).subscribe((response) => {
      spinnerService.hide();
      if (response.status && response.status === RestResponse.SUCCESS) {
        if (response.connectionIsValid) {
          messageService.showSuccessMessage('settings.asset.connection_success');
        } else {
          messageService.showErrorMessage('settings.asset.connection_failed');
        }
      } else {
        messageService.showErrorMessage('settings.asset.unknown_connection_error');
      }
    }, (error) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService, centralServerService,
        'settings.asset.unknown_connection_error');
    });
  }
}
