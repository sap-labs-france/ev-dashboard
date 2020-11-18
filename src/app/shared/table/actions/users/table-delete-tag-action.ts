import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { ButtonType, TableActionDef } from '../../../../types/Table';
import { Tag } from '../../../../types/Tag';
import { UserButtonAction } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

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
