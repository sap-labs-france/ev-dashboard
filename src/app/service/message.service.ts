import { Injectable } from '@angular/core';

declare var $: any;

@Injectable()
export class MessageService {
  // Message Template
  private _message_template = `
      <div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">
        <button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>
        <i class="material-icons" data-notify="icon">notifications</i>
        <span data-notify="title"><b>{1}</b></span>
        <span data-notify="message">{2}</span>
        <div class="progress" data-notify="progressbar">
          <div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>
        </div>
        <a href="{3}" target="{4}" data-notify="url"></a>
      </div>
    `;

  constructor() {
  }

  showMessage(message: string, title?: string) {
    this._showMessage('primary', message, title);
  }

  showInfoMessage(message: string, title?: string) {
    this._showMessage('info', message, title);
  }

  showWarningMessage(message: string, title?: string) {
    this._showMessage('warning', message, title);
  }

  showSuccessMessage(message: string, title?: string) {
    this._showMessage('success', message, title);
  }

  showErrorMessage(message: string, title?: string) {
    this._showMessage('danger', message, title);
  }

  private _showMessage(type, message, title = '', from = 'top', align = 'right', icon = 'notifications') {
    $.notify({
      icon: icon,
      title: title,
      message: message
    }, {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align
        },
        template: this._message_template
      }
    );
  }
}
