import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

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
    super.delete(
      asset, 'assets.delete_title',
      translateService.instant('assets.delete_confirm', { assetName: asset.name }),
      translateService.instant('assets.delete_success', { assetName: asset.name }),
      'assets.delete_error', centralServerService.deleteAsset.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
