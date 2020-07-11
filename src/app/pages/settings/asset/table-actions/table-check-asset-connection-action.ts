import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCheckConnectionAction } from 'app/shared/table/actions/table-check-connection-action';
import { AssetButtonAction } from 'app/types/Asset';
import { RestResponse } from 'app/types/GlobalType';
import { AssetConnectionSetting } from 'app/types/Setting';
import { TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';

export class TableCheckAssetConnectionAction extends TableCheckConnectionAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.CHECK_ASSET_CONNECTION,
      action: this.checkConnectionConfirm,
    };
  }

  private checkConnectionConfirm(assetConnection: AssetConnectionSetting, formArray: FormArray, dialogService: DialogService,
    spinnerService: SpinnerService, translateService: TranslateService, centralServerService: CentralServerService,
    messageService: MessageService, router: Router) {
    if (formArray.dirty) {
      dialogService.createAndShowOkDialog(
        translateService.instant("settings.settings_not_saved_title"),
        translateService.instant("settings.settings_not_saved"),
      ).subscribe();
    } else {
      // Check connection
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
}
