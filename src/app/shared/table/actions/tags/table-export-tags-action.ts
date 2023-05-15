import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TagButtonAction } from 'types/Tag';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { FilterParams } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableExportAction } from '../table-export-action';

export interface TableExportTagsActionDef extends TableActionDef {
  action: (
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportTagsAction extends TableExportAction {
  public getActionDef(): TableExportTagsActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.EXPORT_TAGS,
      action: this.exportTags,
      visible: false,
    };
  }

  private exportTags(
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) {
    super.export(
      filters,
      'exported-tags.csv',
      'users.export_tags_title',
      'users.export_tags_confirm',
      'users.export_tags_error',
      centralServerService.exportTags.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
