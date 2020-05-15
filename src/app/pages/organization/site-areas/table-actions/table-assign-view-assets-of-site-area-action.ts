import { MatDialog } from '@angular/material/dialog';
import { SiteAreaAssetsDialogComponent } from 'app/pages/organization/site-areas/site-area-assets/site-area-assets-dialog.component';
import { TableAssignAction } from 'app/shared/table/actions/table-assign-action';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableViewAssignedAssetsOfSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_ASSETS_OF_SITE_AREA,
      icon: 'account_balance',
      name: 'site_areas.display_assets',
      tooltip: 'general.tooltips.display_assets',
      action: this.viewAssignedAssetsOfSiteArea,
    };
  }

  private viewAssignedAssetsOfSiteArea(siteArea: SiteArea, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(SiteAreaAssetsDialogComponent, siteArea, dialog, refresh);
  }
}
