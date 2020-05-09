import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { TableDeleteAction } from './table-delete-action';

export class TableDeleteAssetAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.DELETE_ASSET,
      action: this.deleteAsset,
    };
  }

  private deleteAsset(asset: Asset, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('assets.delete_title'),
      translateService.instant('assets.delete_confirm', { assetName: asset.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        centralServerService.deleteAsset(asset.id).subscribe((response) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('assets.delete_success', { assetName: asset.name });
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, 'assets.delete_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'assets.delete_error');
        });
      }
    });
  }
}
