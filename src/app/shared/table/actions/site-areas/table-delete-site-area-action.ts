import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteSiteAreaActionDef extends TableActionDef {
  action: (
    siteArea: SiteArea,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteSiteAreaAction extends TableDeleteAction {
  public getActionDef(): TableDeleteSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.DELETE_SITE_AREA,
      action: this.deleteSiteArea,
    };
  }

  private deleteSiteArea(
    siteArea: SiteArea,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      siteArea,
      'site_areas.delete_title',
      translateService.instant('site_areas.delete_confirm', { siteAreaName: siteArea.name }),
      translateService.instant('site_areas.delete_success', { siteAreaName: siteArea.name }),
      'site_areas.delete_error',
      centralServerService.deleteSiteArea.bind(centralServerService),
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
