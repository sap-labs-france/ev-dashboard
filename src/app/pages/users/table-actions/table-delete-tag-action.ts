import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import { UserButtonAction } from 'app/types/User';
import { Utils } from 'app/utils/Utils';
import { data } from 'jquery';
import { Observable } from 'rxjs';

export interface TableDeleteTagActionDef extends TableActionDef {
  action: (tag: Tag, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableDeleteTagAction extends TableDeleteAction {
  public getActionDef(): TableDeleteTagActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.DELETE_TAG,
      action: this.deleteTag,
    };
  }

  private deleteTag(tag: Tag, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
      dialogService.createAndShowYesNoDialog(
        translateService.instant('tags.delete_title'),
        translateService.instant('tags.delete_confirm', { tagID: tag.id }),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          spinnerService.show();
          centralServerService.deleteTag(tag.id).subscribe((response) => {
            spinnerService.hide();
            if (response.status === RestResponse.SUCCESS) {
              messageService.showSuccessMessage(
                translateService.instant('tags.delete_success', { tagID: tag.id }));
              if (refresh) {
                refresh().subscribe();
              }
            } else {
              Utils.handleError(JSON.stringify(response), messageService, 'tags.delete_error');
            }
          }, (error) => {
            spinnerService.hide();
            switch (error.status) {
              // Hash no longer valid
              case HTTPError.TAG_HAS_TRANSACTIONS:
                messageService.showErrorMessage('tags.delete_has_transaction_error');
                break;
              default:
                Utils.handleHttpError(error, router, messageService, centralServerService, 'tags.delete_error');
            }
          });
        }
      }
    );
  }
}
