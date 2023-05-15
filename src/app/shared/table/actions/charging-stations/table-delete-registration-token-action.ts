import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import {
  RegistrationToken,
  RegistrationTokenButtonAction,
} from '../../../../types/RegistrationToken';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteRegistrationTokenActionDef extends TableActionDef {
  action: (
    registrationToken: RegistrationToken,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteRegistrationTokenAction extends TableDeleteAction {
  public getActionDef(): TableDeleteRegistrationTokenActionDef {
    return {
      ...super.getActionDef(),
      id: RegistrationTokenButtonAction.DELETE_TOKEN,
      action: this.deleteToken,
    };
  }

  private deleteToken(
    registrationToken: RegistrationToken,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      registrationToken,
      'chargers.connections.registration_token_delete_title',
      translateService.instant('chargers.connections.registration_token_delete_confirm', {
        ID: registrationToken.id,
      }),
      translateService.instant('chargers.connections.registration_token_delete_success', {
        ID: registrationToken.id,
      }),
      'chargers.connections.registration_token_delete_error',
      centralServerService.deleteRegistrationToken.bind(centralServerService),
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
