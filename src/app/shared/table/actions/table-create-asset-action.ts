import { AssetButtonAction } from 'app/types/Asset';
import { AssetDialogComponent } from 'app/pages/assets/asset/asset.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableCreateAction } from './table-create-action';

export class TableCreateAssetAction extends TableCreateAction {  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.CREATE_ASSET,
      action: this.createAsset,
    }
  }

  private createAsset(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(AssetDialogComponent, dialog, refresh);
  }
}
