import { MatDialog } from '@angular/material/dialog';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Asset, AssetButtonAction } from 'app/types/Asset';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableViewAssetAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.VIEW_ASSET,
      action: this.viewAsset,
    };
  }

  private viewAsset(asset: Asset, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(AssetDialogComponent, asset.id, dialog, refresh);
  }
}
