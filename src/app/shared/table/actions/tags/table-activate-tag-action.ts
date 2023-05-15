import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { Utils } from '../../../../utils/Utils';
import { TableActivateAction } from '../table-activate-action';

export interface TableActivateTagActionDef extends TableActionDef {
  action: (
    tag: Tag,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableActivateTagAction extends TableActivateAction {
  public getActionDef(): TableActivateTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.ACTIVATE_TAG,
      action: this.activateTag,
    };
  }

  private activateTag(
    tag: Tag,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('tags.activate_title'),
        translateService.instant('tags.activate_confirm', { tagID: tag.id })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          const tagUpdated: Tag = {
            id: tag.id,
            issuer: tag.issuer,
            description: tag.description,
            userID: tag.userID,
            visualID: tag.visualID,
            active: true,
          } as Tag;
          centralServerService.updateTag(tagUpdated).subscribe({
            next: (actionResponse) => {
              spinnerService.hide();
              if (actionResponse.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage('tags.activate_success', { tagID: tag.id });
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(JSON.stringify(response), messageService, 'tags.activate_error');
              }
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                'tags.activate_error'
              );
            },
          });
        }
      });
  }
}
