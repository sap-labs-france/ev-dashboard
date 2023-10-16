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
import { TableRevokeAction } from '../table-revoke-action';

export interface TableRevokeRegistrationTokenActionDef extends TableActionDef {
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

export class TableRevokeRegistrationTokenAction extends TableRevokeAction {
  public getActionDef(): TableRevokeRegistrationTokenActionDef {
    return {
      ...super.getActionDef(),
      id: RegistrationTokenButtonAction.REVOKE_TOKEN,
      action: this.revokeRegistrationToken,
    };
  }

  private revokeRegistrationToken(
    registrationToken: RegistrationToken,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.revoke(
      registrationToken,
      translateService.instant('chargers.connections.registration_token_revoke_title'),
      translateService.instant('chargers.connections.registration_token_revoke_confirm'),
      translateService.instant('chargers.connections.registration_token_revoke_success'),
      translateService.instant('chargers.connections.registration_token_revoke_error'),
      centralServerService.revokeRegistrationToken.bind(centralServerService),
      dialogService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      refresh
    );
  }
}
