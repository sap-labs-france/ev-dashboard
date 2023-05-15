import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { WindowService } from 'services/window.service';
import { IntegrationConnection, IntegrationConnectionType } from 'types/Connection';
import { ActionResponse } from 'types/DataResult';
import { RestResponse } from 'types/GlobalType';
import { CarConnectorConnectionSetting, CarConnectorConnectionType } from 'types/Setting';
import { TenantComponents } from 'types/Tenant';
import { User } from 'types/User';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-user-mercedes-car-connector',
  templateUrl: 'user-mercedes-car-connector.component.html',
})
// @Injectable()
export class UserMercedesCarConnectorComponent implements OnInit, OnChanges {
  @Input() public user!: User;
  @Input() public integrationConnections!: IntegrationConnection[];
  @Output() public connectorChanged = new EventEmitter<void>();

  public mercedesConnectionSetting!: CarConnectorConnectionSetting;
  public mercedesConnection!: IntegrationConnection;
  public isMercedesConnectionValid!: boolean;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private windowService: WindowService,
    @Inject(DOCUMENT) private document: any
  ) {}

  public ngOnInit(): void {
    this.loadMercedesSettings();
  }

  public ngOnChanges() {
    this.handleUserConnections();
  }

  public handleUserConnections() {
    if (!Utils.isEmptyArray(this.integrationConnections)) {
      this.mercedesConnection = null;
      this.isMercedesConnectionValid = false;
      for (const connection of this.integrationConnections) {
        if (connection.connectorId === IntegrationConnectionType.MERCEDES) {
          this.mercedesConnection = connection;
          this.isMercedesConnectionValid =
            this.mercedesConnection &&
            this.mercedesConnection.validUntil &&
            new Date(this.mercedesConnection.validUntil).getTime() > new Date().getTime();
        }
      }
    }
  }

  public revokeMercedesAccount() {
    this.centralServerService.deleteIntegrationConnection(this.mercedesConnection.id).subscribe({
      next: (response: ActionResponse) => {
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('settings.car_connector.mercedes.revoke_success');
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'settings.car_connector.mercedes.revoke_error'
          );
        }
        this.connectorChanged.emit();
      },
      error: (error) => {
        Utils.handleError(
          JSON.stringify(error),
          this.messageService,
          'settings.car_connector.mercedes.revoke_error'
        );
        this.connectorChanged.emit();
      },
    });
  }

  public linkMercedesAccount() {
    if (!this.mercedesConnectionSetting || !this.mercedesConnectionSetting.mercedesConnection) {
      this.messageService.showErrorMessage(
        this.translateService.instant('settings.car_connector.mercedes.link_error')
      );
    } else {
      // Mercedes
      const mercedesSetting = this.mercedesConnectionSetting.mercedesConnection;
      const returnedUrl = `${this.windowService.getOrigin()}/users/mercedes-connections`;
      const state = {
        connector: IntegrationConnectionType.MERCEDES,
        appId: this.mercedesConnectionSetting.id,
        userId: this.user?.id,
      };
      this.document.location.href =
        // eslint-disable-next-line max-len
        `${mercedesSetting.authenticationUrl}/as/authorization.oauth2?client_id=${
          mercedesSetting.clientId
        }&response_type=code&scope=mb:vehicle:mbdata:evstatus offline_access&redirect_uri=${returnedUrl}&state=${JSON.stringify(
          state
        )}`;
    }
  }

  private loadMercedesSettings() {
    if (this.componentService.isActive(TenantComponents.CAR_CONNECTOR)) {
      this.componentService.getCarConnectorSettings().subscribe((carConnectorSettings) => {
        this.mercedesConnectionSetting = carConnectorSettings.carConnector.connections.find(
          (connection) => connection.type === CarConnectorConnectionType.MERCEDES
        );
      });
    }
  }
}
