import { Component, Input } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { RegistrationToken } from '../../../../common.types';
import { MessageService } from '../../../../services/message.service';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-registration-token-url-formatter',
  templateUrl: 'registration-token-url.component.html'
})
export class RegistrationTokenUrlComponent extends CellContentTemplateComponent {
  @Input() row: RegistrationToken;

  constructor(private messageService: MessageService) {
    super();
  }

  copyClipboard(content: string) {
    Utils.copyToClipboard(content);

    this.messageService.showInfoMessage('settings.charging_station.url_copied');
  }
}
