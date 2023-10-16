import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from 'shared/table/filters/site-area-table-filter';
import { DataResultAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import {
  TableCreateRegistrationTokenAction,
  TableCreateRegistrationTokenActionDef,
} from '../../../shared/table/actions/charging-stations/table-create-registration-token-action';
import {
  TableDeleteRegistrationTokenAction,
  TableDeleteRegistrationTokenActionDef,
} from '../../../shared/table/actions/charging-stations/table-delete-registration-token-action';
import {
  TableEditRegistrationTokenAction,
  TableEditRegistrationTokenActionDef,
} from '../../../shared/table/actions/charging-stations/table-edit-registration-token-action';
import {
  TableRevokeRegistrationTokenAction,
  TableRevokeRegistrationTokenActionDef,
} from '../../../shared/table/actions/charging-stations/table-revoke-registration-token-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableCopyAction } from '../../../shared/table/actions/table-copy-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableMultiCopyAction } from '../../../shared/table/actions/table-multi-copy-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult } from '../../../types/DataResult';
import { RegistrationToken, RegistrationTokenButtonAction } from '../../../types/RegistrationToken';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsRegistrationTokenStatusComponent } from './registration-token/charging-stations-registration-token-status.component';
import { ChargingStationsRegistrationTokenDialogComponent } from './registration-token/charging-stations-registration-token.dialog.component';

@Injectable()
export class ChargingStationsRegistrationTokensTableDataSource extends TableDataSource<RegistrationToken> {
  private createAction = new TableCreateRegistrationTokenAction().getActionDef();
  private deleteAction = new TableDeleteRegistrationTokenAction().getActionDef();
  private editAction = new TableEditRegistrationTokenAction().getActionDef();
  private revokeAction = new TableRevokeRegistrationTokenAction().getActionDef();
  private copySOAP15SecureAction = new TableCopyAction(
    'chargers.connections.ocpp_15_soap_secure'
  ).getActionDef();
  private copySOAP16SecureAction = new TableCopyAction(
    'chargers.connections.ocpp_16_soap_secure'
  ).getActionDef();
  private copyJSON16SecureAction = new TableCopyAction(
    'chargers.connections.ocpp_16_json_secure'
  ).getActionDef();
  private registrationTokensAuthorizations: DataResultAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<RegistrationToken>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService
        .getRegistrationTokens(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (registrationTokens) => {
            this.createAction.visible = registrationTokens.canCreate;
            // Initialise authorizations
            this.registrationTokensAuthorizations = {
              // Metadata
              metadata: registrationTokens.metadata,
            };
            observer.next(registrationTokens);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
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
        id: 'id',
        name: 'general.id',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
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
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      columns.push({
        id: 'siteArea.name',
        name: 'site_areas.title',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      });
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
      }
    );
    return columns;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    tableActionsDef.unshift(this.createAction);
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(registrationToken: RegistrationToken): TableActionDef[] {
    const asExpired = moment(registrationToken.expirationDate).isBefore(new Date());
    const isRevoked = registrationToken.revocationDate ? true : false;
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    const copyUrlActions: TableActionDef[] = [
      ...(!Utils.isUndefined(registrationToken.ocpp15SOAPSecureUrl)
        ? [this.copySOAP15SecureAction]
        : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16SOAPSecureUrl)
        ? [this.copySOAP16SecureAction]
        : []),
      ...(!Utils.isUndefined(registrationToken.ocpp16JSONSecureUrl)
        ? [this.copyJSON16SecureAction]
        : []),
    ];
    if (!asExpired && !isRevoked) {
      rowActions.push(
        new TableMultiCopyAction(
          copyUrlActions,
          'chargers.connections.copy_url_tooltip',
          'chargers.connections.copy_url_tooltip'
        ).getActionDef()
      );
    }
    if (registrationToken.canUpdate) {
      rowActions.push(this.editAction);
    }
    if (registrationToken.canRevoke && !asExpired && !isRevoked) {
      rowActions.push(this.revokeAction);
    }
    if (registrationToken.canDelete) {
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
          (actionDef as TableCreateRegistrationTokenActionDef).action(
            ChargingStationsRegistrationTokenDialogComponent,
            this.dialog,
            { authorizations: this.registrationTokensAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, registrationToken: RegistrationToken) {
    switch (actionDef.id) {
      case RegistrationTokenButtonAction.REVOKE_TOKEN:
        if (actionDef.action) {
          (actionDef as TableRevokeRegistrationTokenActionDef).action(
            registrationToken,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case RegistrationTokenButtonAction.DELETE_TOKEN:
        if (actionDef.action) {
          (actionDef as TableDeleteRegistrationTokenActionDef).action(
            registrationToken,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case RegistrationTokenButtonAction.EDIT_TOKEN:
        if (actionDef.action) {
          (actionDef as TableEditRegistrationTokenActionDef).action(
            ChargingStationsRegistrationTokenDialogComponent,
            this.dialog,
            { dialogData: registrationToken },
            this.refreshData.bind(this)
          );
        }
        break;
      case RegistrationTokenButtonAction.COPY_URL:
        let url: string;
        switch (actionDef.name) {
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
        void Utils.copyToClipboard(url);
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
    const issuerFilter = new IssuerFilter().getFilterDef();
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      return [new SiteAreaTableFilter([issuerFilter]).getFilterDef()];
    }
    return [];
  }
}
