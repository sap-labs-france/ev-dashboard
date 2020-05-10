import { ButtonType, TableActionDef } from 'app/types/Table';
import { SiteArea, SiteAreaButtonAction } from 'app/types/SiteArea';

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
    dialogService.createAndShowYesNoDialog(
      translateService.instant('site_areas.delete_title'),
      translateService.instant('site_areas.delete_confirm', { siteAreaName: siteArea.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        centralServerService.deleteSiteArea(siteArea.id).subscribe((response) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('site_areas.delete_success', { siteAreaName: siteArea.name });
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, 'site_areas.delete_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'site_areas.delete_error');
        });
      }
    });
  }
}
