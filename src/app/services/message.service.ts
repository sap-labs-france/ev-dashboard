import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ActionsResponse } from '../types/DataResult';

declare let $: any;

@Injectable()
export class MessageService {
  private lastLostConnectionDate: Date = new Date();
  // Message Template
  private messageTemplate = `
    <div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">
      <button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">
        <i class="material-icons">close</i>
      </button>
      <i class="material-icons" data-notify="icon">notifications</i>
      <span data-notify="title"><b>{1}</b></span>
      <span data-notify="message">{2}</span>
      <div class="progress" data-notify="progressbar">
        <div class="progress-bar progress-bar-{0} progress-bar-custom" role="progressbar"
          aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
      <a href="{3}" target="{4}" data-notify="url"></a>
    </div>
  `;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private translateService: TranslateService) {}

  public showErrorMessageConnectionLost(): void {
    // Avoid multiple same messages when connection is lost during 5 secs
    if (new Date().getTime() - this.lastLostConnectionDate.getTime() > 5000) {
      this.showErrorMessage('general.backend_not_running');
      this.lastLostConnectionDate = new Date();
    }
  }

  public showWarningMessageUserOrTenantUpdated(): void {
    this.showWarningMessage('general.user_or_tenant_updated');
  }

  public showInfoMessage(message: string, params?: Record<string, unknown>, title?: string): void {
    this.showMessage('info', message, title, params);
  }

  public showWarningMessage(
    message: string,
    params?: Record<string, unknown>,
    title?: string
  ): void {
    this.showMessage('warning', message, title, params);
  }

  public showSuccessMessage(
    message: string,
    params?: Record<string, unknown>,
    title?: string
  ): void {
    this.showMessage('success', message, title, params);
  }

  public showErrorMessage(message: string, params?: Record<string, unknown>, title?: string): void {
    this.showMessage('danger', message, title, params);
  }

  public showActionsMessage(
    actionsResponse: ActionsResponse,
    messageSuccess: string,
    messageError: string,
    messageSuccessAndError: string,
    messageNoSuccessNoError: string,
    displaySuccessAsInfo = false
  ): void {
    // Success and Error
    if (actionsResponse.inSuccess > 0 && actionsResponse.inError > 0) {
      this.showWarningMessage(messageSuccessAndError, {
        inSuccess: actionsResponse.inSuccess,
        inError: actionsResponse.inError,
      });
      // Success
    } else if (actionsResponse.inSuccess > 0) {
      if (displaySuccessAsInfo) {
        this.showInfoMessage(messageSuccess, { inSuccess: actionsResponse.inSuccess });
      } else {
        this.showSuccessMessage(messageSuccess, { inSuccess: actionsResponse.inSuccess });
      }
    } else if (actionsResponse.inError > 0) {
      this.showErrorMessage(messageError, { inError: actionsResponse.inError });
    } else {
      this.showInfoMessage(messageNoSuccessNoError);
    }
  }

  private showMessage(
    type: string,
    message: string,
    title = '',
    params?: Record<string, unknown>,
    from = 'top',
    align = 'right',
    icon = 'notifications'
  ) {
    let translatedMessage = this.translateService.instant(message, params);
    translatedMessage = $('<div/>').text(translatedMessage).html();
    $.notify(
      {
        icon,
        title,
        message: translatedMessage,
      },
      {
        type,
        delay: 3000,
        timer: 1500,
        allow_dismiss: true,
        placement: {
          from,
          align,
        },
        z_index: 10000,
        template: this.messageTemplate,
      }
    );
  }
}
