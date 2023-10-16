import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteSiteActionDef extends TableActionDef {
  action: (
    site: Site,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteSiteAction extends TableDeleteAction {
  public getActionDef(): TableDeleteSiteActionDef {
    return {
      ...super.getActionDef(),
      id: SiteButtonAction.DELETE_SITE,
      action: this.deleteSite,
    };
  }

  private deleteSite(
    site: Site,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      site,
      'sites.delete_title',
      translateService.instant('sites.delete_confirm', { siteName: site.name }),
      translateService.instant('sites.delete_success', { siteName: site.name }),
      'sites.delete_error',
      centralServerService.deleteSite.bind(centralServerService),
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
