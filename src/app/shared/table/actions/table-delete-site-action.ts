import { Site, SiteButtonAction } from 'app/types/Site';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActionDef } from 'app/types/Table';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';

export class TableDeleteSiteAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.DELETE_SITE,
      action: this.deleteSite,
    };
  }

  private deleteSite(site: Site, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      site, 'sites.delete_title',
      translateService.instant('sites.delete_confirm', { siteName: site.name }),
      translateService.instant('sites.delete_success', { siteName: site.name }),
      'sites.delete_error', centralServerService.deleteSite.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
