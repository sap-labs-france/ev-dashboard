import { MatDialog } from '@angular/material/dialog';
import { SiteUsersDialogComponent } from 'app/pages/organization/sites/site-users/site-users-dialog.component';
import { Site, SiteButtonAction } from 'app/types/Site';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableAssignAction } from './table-assign-action';

export class TableAssignUsersToSiteAction extends TableAssignAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.ASSIGN_USERS_TO_SITE,
      icon: 'people',
      name: 'general.edit',
      tooltip: 'general.tooltips.edit_users',
      action: this.assignUsersToSite,
    };
  }

  private assignUsersToSite(site: Site, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(SiteUsersDialogComponent, site, dialog, refresh);
  }
}
