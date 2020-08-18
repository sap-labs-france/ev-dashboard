import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableActionDef } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

export class TableDeleteTagAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.DELETE_TAG,
      action: this.deleteTag,
    };
  }

  private deleteTag(tag: Tag, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      tag, 'tags.delete_title',
      translateService.instant('tags.delete_confirm', { tagID: tag.id }),
      translateService.instant('tags.delete_success', { tagID: tag.id }),
      'tags.delete_error',
      centralServerService.deleteTag.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
