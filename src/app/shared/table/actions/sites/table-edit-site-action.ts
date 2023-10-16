import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, SitesAuthorizations } from '../../../../types/Authorization';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditSiteActionDef extends TableActionDef {
  action: (
    siteDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Site, SitesAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditSiteAction extends TableEditAction {
  public getActionDef(): TableEditSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.EDIT_SITE,
      action: this.editSite,
    };
  }

  private editSite(
    siteDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Site, SitesAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(siteDialogComponent, dialog, dialogParams, refresh);
  }
}
