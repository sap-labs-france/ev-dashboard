import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Asset, AssetButtonAction } from '../../../../types/Asset';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteAssetActionDef extends TableActionDef {
  action: (
    asset: Asset,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteAssetAction extends TableDeleteAction {
  public getActionDef(): TableDeleteAssetActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.DELETE_ASSET,
      action: this.deleteAsset,
    };
  }

  private deleteAsset(
    asset: Asset,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      asset,
      'assets.delete_title',
      translateService.instant('assets.delete_confirm', { assetName: asset.name }),
      translateService.instant('assets.delete_success', { assetName: asset.name }),
      'assets.delete_error',
      centralServerService.deleteAsset.bind(centralServerService),
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
