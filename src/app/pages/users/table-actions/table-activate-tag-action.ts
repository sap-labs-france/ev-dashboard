import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActivateAction } from 'app/shared/table/actions/table-activate-action';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableActivateTagAction extends TableActivateAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.ACTIVATE_TAG,
      action: this.activateTag,
    };
  }

  private activateTag(tagID: string, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('tags.activate_title'),
      translateService.instant('tags.activate_confirm', { tagID }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.updateTagStatus(tagID, true).subscribe((actionResponse) => {
          spinnerService.hide();
          if (actionResponse.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('tags.activate_success', { tagID });
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response), messageService, 'tags.activate_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'tags.activate_error');
        });
      }
    });
  }
}
