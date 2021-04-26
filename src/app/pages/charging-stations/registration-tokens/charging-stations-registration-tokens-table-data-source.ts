import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { TableCreateRegistrationTokenAction, TableCreateRegistrationTokenActionDef } from '../../../shared/table/actions/charging-stations/table-create-registration-token-action';
import { TableDeleteRegistrationTokenAction, TableDeleteRegistrationTokenActionDef } from '../../../shared/table/actions/charging-stations/table-delete-registration-token-action';
import { TableEditRegistrationTokenAction, TableEditRegistrationTokenActionDef } from '../../../shared/table/actions/charging-stations/table-edit-registration-token-action';
import { TableRevokeRegistrationTokenAction, TableRevokeRegistrationTokenActionDef } from '../../../shared/table/actions/charging-stations/table-revoke-registration-token-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableCopyAction } from '../../../shared/table/actions/table-copy-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableMultiCopyAction } from '../../../shared/table/actions/table-multi-copy-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { RegistrationToken, RegistrationTokenButtonAction } from '../../../types/RegistrationToken';
import { SiteArea } from '../../../types/SiteArea';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsRegistrationTokenStatusComponent } from './registration-token/charging-stations-registration-token-status.component';
import { ChargingStationsRegistrationTokenDialogComponent } from './registration-token/charging-stations-registration-token.dialog.component';

@Injectable()
export class ChargingStationsRegistrationTokensTableDataSource extends TableDataSource<RegistrationToken> {
  private readonly isOrganizationComponentActive: boolean;
  private deleteAction = new TableDeleteRegistrationTokenAction().getActionDef();
  private editAction = new TableEditRegistrationTokenAction().getActionDef();
  private revokeAction = new TableRevokeRegistrationTokenAction().getActionDef();
  private copySOAP15Action = new TableCopyAction('chargers.connections.ocpp_15_soap').getActionDef();
  private copySOAP16Action = new TableCopyAction('chargers.connections.ocpp_16_soap').getActionDef();
  private copyJSON16Action = new TableCopyAction('chargers.connections.ocpp_16_json').getActionDef();
  private copySOAP15SecureAction = new TableCopyAction('chargers.connections.ocpp_15_soap_secure').getActionDef();
  private copySOAP16SecureAction = new TableCopyAction('chargers.connections.ocpp_16_soap_secure').getActionDef();
  private copyJSON16SecureAction = new TableCopyAction('chargers.connections.ocpp_16_json_secure').getActionDef();
  private canUpdateToken: boolean;
  private canCreateToken: boolean;
  private canDeleteToken: boolean;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private componentService: ComponentService,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    this.canUpdateToken = this.authorizationService.canUpdateToken();
    this.canCreateToken = this.authorizationService.canCreateToken();
    this.canDeleteToken = this.authorizationService.canDeleteToken();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectRegistrationTokens();
  }

  public loadDataImpl(): Observable<DataResult<RegistrationToken>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getRegistrationTokens(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((tokens) => {
        observer.next(tokens);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'status',
        name: 'users.status',
        isAngularComponent: true,
        angularComponent: ChargingStationsRegistrationTokenStatusComponent,
        headerClass: 'col-5p text-center',
        class: 'col-5p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'd-none d-xl-table-cell col-30p',
        class: 'd-none d-xl-table-cell col-30p',
      },
      {
        id: 'expirationDate',
        name: 'general.expired_on',
        formatter: (expirationDate: Date) => this.datePipe.transform(expirationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true,
      },
      {
        id: 'revocationDate',
        name: 'general.revoked_on',
        formatter: (revocationDate: Date) => this.datePipe.transform(revocationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true,
      },
    ];
    if (this.isOrganizationComponentActive) {
      columns.push(
        {
          id: 'siteArea',
          name: 'site_areas.title',
          formatter: (siteArea: SiteArea) => siteArea ? siteArea.name : '',
          headerClass: 'col-15p',
          class: 'col-15p',
          sortable: true,
        }
      );
    }
    columns.push(
      {
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        sorted: true,
      },
      {
        id: 'createdBy',
        name: 'users.created_by',
        formatter: (user: User) => Utils.buildUserFullName(user),
        headerClass: 'col-15em',
        class: 'col-15em',
      },
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        formatter: (user: User) => Utils.buildUserFullName(user),
        headerClass: 'col-15em',
        class: 'col-15em',
      },
    );
    return columns;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.canCreateToken) {
      tableActionsDef.unshift(new TableCreateRegistrationTokenAction().getActionDef());
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(registrationToken: RegistrationToken): TableActionDef[] {
    const asExpired = moment(registrationToken.expirationDate).isBefore(new Date());
    const isRevoked = registrationToken.revocationDate ? true : false;
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    const copyUrlActions: TableActionDef[] = [
      ...(!Utils.isUndefined(registrationToken.ocpp15SOAPUrl) ? [this.copySOAP15Action] : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16SOAPUrl) ? [this.copySOAP16Action] : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16JSONUrl) ? [this.copyJSON16Action] : []),
      ...(!Utils.isUndefined(registrationToken.ocpp15SOAPSecureUrl) ? [this.copySOAP15SecureAction] : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16SOAPSecureUrl) ? [this.copySOAP16SecureAction] : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16JSONSecureUrl) ? [this.copyJSON16SecureAction] : [])
    ];
    if (!asExpired && !isRevoked) {
      rowActions.push(new TableMultiCopyAction(
        copyUrlActions,
        'chargers.connections.copy_url_tooltip',
        'chargers.connections.copy_url_tooltip').getActionDef());
    }
    if (this.canUpdateToken) {
      rowActions.push(this.editAction);
      if (!asExpired && !isRevoked) {
        rowActions.push(this.revokeAction);
      }
    }
    if (this.canDeleteToken) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case RegistrationTokenButtonAction.CREATE_TOKEN:
        if (actionDef.id) {
          (actionDef as TableCreateRegistrationTokenActionDef).action(ChargingStationsRegistrationTokenDialogComponent,
            this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, registrationToken: RegistrationToken) {
    switch (actionDef.id) {
      case RegistrationTokenButtonAction.REVOKE_TOKEN:
        if (actionDef.action) {
          (actionDef as TableRevokeRegistrationTokenActionDef).action(
            registrationToken, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case RegistrationTokenButtonAction.DELETE_TOKEN:
        if (actionDef.action) {
          (actionDef as TableDeleteRegistrationTokenActionDef).action(
            registrationToken, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case RegistrationTokenButtonAction.EDIT_TOKEN:
        if (actionDef.action) {
          (actionDef as TableEditRegistrationTokenActionDef).action(
            ChargingStationsRegistrationTokenDialogComponent, this.dialog,
            { dialogData: registrationToken }, this.refreshData.bind(this));
        }
        break;
      case RegistrationTokenButtonAction.COPY_URL:
        let url: string;
        switch (actionDef.name) {
          case 'chargers.connections.ocpp_15_soap':
            url = registrationToken.ocpp15SOAPUrl;
            break;
          case 'chargers.connections.ocpp_16_soap':
            url = registrationToken.ocpp16SOAPUrl;
            break;
          case 'chargers.connections.ocpp_16_json':
            url = registrationToken.ocpp16JSONUrl;
            break;
          case 'chargers.connections.ocpp_15_soap_secure':
            url = registrationToken.ocpp15SOAPSecureUrl;
            break;
          case 'chargers.connections.ocpp_16_soap_secure':
            url = registrationToken.ocpp16SOAPSecureUrl;
            break;
          case 'chargers.connections.ocpp_16_json_secure':
            url = registrationToken.ocpp16JSONSecureUrl;
            break;
        }
        Utils.copyToClipboard(url);
        this.messageService.showInfoMessage('chargers.connections.url_copied');
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
