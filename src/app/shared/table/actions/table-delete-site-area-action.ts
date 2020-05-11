import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActionDef } from 'app/types/Table';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';

export class TableDeleteSiteAreaAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.DELETE_SITE_AREA,
      action: this.deleteSiteArea,
    };
  }

  private deleteSiteArea(siteArea: SiteArea, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      siteArea, 'site_areas.delete_title',
      translateService.instant('site_areas.delete_confirm', { siteAreaName: siteArea.name }),
      translateService.instant('site_areas.delete_success', { siteAreaName: siteArea.name }),
      'site_areas.delete_error', centralServerService.deleteSiteArea.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
