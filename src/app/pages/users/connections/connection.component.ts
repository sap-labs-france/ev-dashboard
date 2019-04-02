import {Component, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {DOCUMENT} from '@angular/common';
import {ActionResponse} from '../../../common.types';
import {WindowService} from '../../../services/window.service';
import {AbstractTabComponent} from '../../../shared/component/tab/AbstractTab.component';

@Component({
  selector: 'app-connection-cmp',
  templateUrl: 'connection.component.html'
})
export class ConnectionComponent extends AbstractTabComponent {
  public isAdmin;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    @Inject(DOCUMENT) private document: any,
    activatedRoute: ActivatedRoute,
    windowService: WindowService) {
    super(activatedRoute, windowService, [], false);


    if (this.activatedRoute.snapshot.queryParams['state']) {
      const state = JSON.parse(this.activatedRoute.snapshot.queryParams['state']);
      if (state.connector === 'concur') {
        this._createConcurConnection(state);
      }
    }
  }

  private _createConcurConnection(state) {
    if (this.activatedRoute.snapshot.queryParams['code']) {
      const payload = {
        settingId: state.appId,
        userId: state.userId,
        connectorId: 'concur',
        data:
          {
            code: this.activatedRoute.snapshot.queryParams['code'],
            redirectUri: this.windowService.getOrigin() + this.windowService.getPath()
          }
      };
      this.centralServerService.createIntegrationConnection(payload).subscribe((response: ActionResponse) => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('settings.chargeathome.concur.link_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.chargeathome.concur.link_error');
          }
        }, (error) => {
          Utils.handleError(JSON.stringify(error),
            this.messageService, 'settings.chargeathome.concur.link_error');
        }
      );
    } else if (this.activatedRoute.snapshot.queryParams['error']) {
      Utils.handleError(this.activatedRoute.snapshot.queryParams['error'],
        this.messageService, 'settings.chargeathome.concur.link_error');
    }
    this.router.navigate([`/users/${state.userId}#connectors`])
  }

}
