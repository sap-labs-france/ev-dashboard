import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

declare var $: any;

@Injectable()
export class MessageService {
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
          <div class="progress-bar progress-bar-{0}" role="progressbar"
            aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">
          </div>
        </div>
        <a href="{3}" target="{4}" data-notify="url"></a>
      </div>
    `;

  constructor(
    private translateService: TranslateService) {
  }

  public showErrorMessageConnectionLost() {
    this.showErrorMessage('general.backend_not_running');
  }

  public showWarningMessageUserOrTenantUpdated() {
    this.showWarningMessage('general.user_or_tenant_updated');
  }

  public showMessage(message: string, params?: Object, title?: string) {
    this._showMessage('primary', message, title, params);
  }

  public showInfoMessage(message: string, params?: Object, title?: string) {
    this._showMessage('info', message, title, params);
  }

  public showWarningMessage(message: string, params?: Object, title?: string) {
    this._showMessage('warning', message, title, params);
  }

  public showSuccessMessage(message: string, params?: Object, title?: string) {
    this._showMessage('success', message, title, params);
  }

  public showErrorMessage(message: string, params?: Object, title?: string) {
    this._showMessage('danger', message, title, params);
  }

  private _showMessage(type, message, title = '', params?: Object, from = 'top', align = 'right', icon = 'notifications') {
    $.notify({
        icon: icon,
        title: title,
        message: this.translateService.instant(message, params)
      }, {
        type: type,
        delay: 3000,
        timer: 1500,
        allow_dismiss: true,
        placement: {
          from: from,
          align: align
        },
        z_index: 10000,
        template: this.messageTemplate
      }
    );
  }
}
