import { ButtonType, TableActionDef } from 'app/types/Table';
import { Site, SiteButtonAction } from 'app/types/Site';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

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
    dialogService.createAndShowYesNoDialog(
      translateService.instant('sites.delete_title'),
      translateService.instant('sites.delete_confirm', { siteName: site.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
          spinnerService.show();
          centralServerService.deleteSite(site.id).subscribe((response) => {
            spinnerService.hide();
            if (response.status === RestResponse.SUCCESS) {
              messageService.showSuccessMessage('sites.delete_success', { siteName: site.name });
              if (refresh) {
                refresh().subscribe();
              }
            } else {
              Utils.handleError(JSON.stringify(response),
                messageService, 'sites.delete_error');
            }
          }, (error) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService, centralServerService,
              'sites.delete_error');
          });
      }
    });
  }
}
