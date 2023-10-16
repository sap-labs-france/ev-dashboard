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
import { RefundSettings } from 'types/Setting';
import { TenantComponents } from 'types/Tenant';
import { User } from 'types/User';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-user-concur-refund-connector',
  templateUrl: 'user-concur-refund-connector.component.html',
})
// @Injectable()
export class UserConcurRefundConnectorComponent implements OnInit, OnChanges {
  @Input() public user!: User;
  @Input() public integrationConnections!: IntegrationConnection[];
  @Output() public connectorChanged = new EventEmitter<void>();

  public refundSetting!: RefundSettings;
  public refundConnection!: IntegrationConnection;
  public isRefundConnectionValid!: boolean;

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
    this.loadConcurSettings();
  }

  public ngOnChanges() {
    this.handleUserConnections();
  }

  public handleUserConnections() {
    if (!Utils.isEmptyArray(this.integrationConnections)) {
      this.refundConnection = null;
      this.isRefundConnectionValid = false;
      for (const connection of this.integrationConnections) {
        if (connection.connectorId === IntegrationConnectionType.CONCUR) {
          this.refundConnection = connection;
          this.isRefundConnectionValid =
            this.refundConnection &&
            this.refundConnection.validUntil &&
            new Date(this.refundConnection.validUntil).getTime() > new Date().getTime();
        }
      }
    }
  }

  public revokeRefundAccount() {
    this.centralServerService.deleteIntegrationConnection(this.refundConnection.id).subscribe({
      next: (response: ActionResponse) => {
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('settings.refund.concur.revoke_success');
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'settings.refund.concur.revoke_error'
          );
        }
        this.connectorChanged.emit();
      },
      error: (error) => {
        Utils.handleError(
          JSON.stringify(error),
          this.messageService,
          'settings.refund.concur.revoke_error'
        );
        this.connectorChanged.emit();
      },
    });
  }

  public linkRefundAccount() {
    if (!this.refundSetting || !this.refundSetting.concur) {
      this.messageService.showErrorMessage(
        this.translateService.instant(
          'transactions.notification.refund.tenant_concur_connection_invalid'
        )
      );
    } else {
      // Concur
      const concurSetting = this.refundSetting.concur;
      const returnedUrl = `${this.windowService.getOrigin()}/users/connections`;
      const state = {
        connector: IntegrationConnectionType.CONCUR,
        appId: this.refundSetting.id,
        userId: this.user?.id,
      };
      this.document.location.href =
        // eslint-disable-next-line max-len
        `${concurSetting.authenticationUrl}/oauth2/v0/authorize?client_id=${
          concurSetting.clientId
        }&response_type=code&scope=EXPRPT&redirect_uri=${returnedUrl}&state=${JSON.stringify(
          state
        )}`;
    }
  }

  public getRefundUrl(): string | null {
    if (this.refundSetting && this.refundSetting.concur) {
      return this.refundSetting.concur.apiUrl;
    }
    return null;
  }

  private loadConcurSettings() {
    if (this.componentService.isActive(TenantComponents.REFUND)) {
      this.componentService.getRefundSettings().subscribe((refundSettings) => {
        this.refundSetting = refundSettings;
      });
    }
  }
}
