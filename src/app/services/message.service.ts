import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

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

  constructor(
    private translateService: TranslateService) {
  }

  public showErrorMessageConnectionLost(): void {
    // Avoid multiple same messages when connection is lost during 5 secs
    if ((new Date().getTime() - this.lastLostConnectionDate.getTime()) > 5000) {
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

  public showWarningMessage(message: string, params?: Record<string, unknown>, title?: string): void {
    this.showMessage('warning', message, title, params);
  }

  public showSuccessMessage(message: string, params?: Record<string, unknown>, title?: string): void {
    this.showMessage('success', message, title, params);
  }

  public showErrorMessage(message: string, params?: Record<string, unknown>, title?: string): void {
    this.showMessage('danger', message, title, params);
  }

  private showMessage(type: string, message: string, title = '', params?: Record<string, unknown>, from = 'top', align = 'right', icon = 'notifications') {
    $.notify({
        icon,
        title,
        message: this.translateService.instant(message, params),
      }, {
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
      },
    );
  }
}
