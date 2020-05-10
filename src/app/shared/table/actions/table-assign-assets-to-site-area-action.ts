import { MatDialog } from '@angular/material/dialog';
import { SiteAreaAssetsDialogComponent } from 'app/pages/organization/site-areas/site-area-assets/site-area-assets-dialog.component';
import { AssetButtonAction } from 'app/types/Asset';
import { SiteArea } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableAssignAction } from './table-assign-action';

export class TableAssignAssetsToSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: AssetButtonAction.ASSIGN_ASSETS_TO_SITE_AREA,
      icon: 'account_balance',
      name: 'site_areas.edit_assets',
      tooltip: 'general.tooltips.edit_assets',
      action: this.assignAssetsToSiteArea,
    };
  }

  private assignAssetsToSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(SiteAreaAssetsDialogComponent, siteArea, dialog, refresh);
  }
}
