import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IntegrationConnectionType } from 'types/Connection';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { WindowService } from '../../../../services/window.service';
import { AbstractTabComponent } from '../../../../shared/component/abstract-tab/abstract-tab.component';
import { ActionResponse } from '../../../../types/DataResult';
import { RestResponse } from '../../../../types/GlobalType';
import { Utils } from '../../../../utils/Utils';

@Component({
  templateUrl: 'mercedes-user-connection.component.html',
})
export class MercedesUserConnectionComponent extends AbstractTabComponent {
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, [], false);

    if (this.activatedRoute.snapshot.queryParams['state']) {
      const state = JSON.parse(this.activatedRoute.snapshot.queryParams['state']);
      if (state.connector === IntegrationConnectionType.MERCEDES) {
        this.createMercedesConnection(state);
      }
    }
  }

  private createMercedesConnection(state: any) {
    if (this.activatedRoute.snapshot.queryParams['code']) {
      const payload = {
        userId: state.userId,
        connectorId: IntegrationConnectionType.MERCEDES,
        data: {
          code: this.activatedRoute.snapshot.queryParams['code'],
          redirectUri: this.windowService.getOrigin() + this.windowService.getPath(),
        },
      };
      this.centralServerService.createIntegrationConnection(payload).subscribe({
        next: (response: ActionResponse) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('settings.car_connector.mercedes.link_success');
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              'settings.car_connector.mercedes.link_error'
            );
          }
          void this.router.navigate(['/users/profile'], { fragment: 'connections' });
        },
        error: (error) => {
          Utils.handleError(
            JSON.stringify(error),
            this.messageService,
            'settings.car_connector.mercedes.link_error'
          );
          void this.router.navigate(['/users/profile'], { fragment: 'connections' });
        },
      });
    } else if (this.activatedRoute.snapshot.queryParams['error']) {
      Utils.handleError(
        this.activatedRoute.snapshot.queryParams['error'],
        this.messageService,
        'settings.car_connector.mercedes.link_error'
      );
      void this.router.navigate(['/users/profile'], { fragment: 'connections' });
    }
  }
}
