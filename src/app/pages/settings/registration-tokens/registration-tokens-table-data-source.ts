import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ComponentService } from 'services/component.service';
import TenantComponents from 'types/TenantComponents';

import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableCopyAction } from '../../../shared/table/actions/table-copy-action';
import { TableCreateAction } from '../../../shared/table/actions/table-create-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableMultiCopyAction } from '../../../shared/table/actions/table-multi-copy-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableRevokeAction } from '../../../shared/table/actions/table-revoke-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../types/GlobalType';
import { RegistrationToken } from '../../../types/RegistrationToken';
import { SiteArea } from '../../../types/SiteArea';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { RegistrationTokenStatusComponent } from './registration-token/registration-token-status.component';
import { RegistrationTokenDialogComponent } from './registration-token/registration-token.dialog.component';

@Injectable()
export class RegistrationTokensTableDataSource extends TableDataSource<RegistrationToken> {
  private readonly isOrganizationComponentActive: boolean;
  private deleteAction = new TableDeleteAction().getActionDef();
  private revokeAction = new TableRevokeAction().getActionDef();
  private copySOAP15Action = new TableCopyAction('settings.charging_station.ocpp_15_soap').getActionDef();
  private copySOAP16Action = new TableCopyAction('settings.charging_station.ocpp_16_soap').getActionDef();
  private copyJSON16Action = new TableCopyAction('settings.charging_station.ocpp_16_json').getActionDef();
  private copyUrlAction = new TableMultiCopyAction(
    [this.copySOAP15Action, this.copySOAP16Action, this.copyJSON16Action],
    'settings.charging_station.copy_url_tooltip',
    'settings.charging_station.copy_url_tooltip').getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private componentService: ComponentService,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
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
        angularComponent: RegistrationTokenStatusComponent,
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
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(registrationToken: RegistrationToken): TableActionDef[] {
    if (registrationToken.revocationDate || moment().isAfter(registrationToken.expirationDate)) {
      return [this.deleteAction];
    }
    return [
      this.copyUrlAction,
      this.revokeAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.CREATE:
        this.createRegistrationToken();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, registrationToken: RegistrationToken) {
    switch (actionDef.id) {
      case ButtonAction.REVOKE:
        this.revokeToken(registrationToken);
        break;
      case ButtonAction.DELETE:
        this.deleteToken(registrationToken);
        break;
      case ButtonAction.COPY:
        let url;
        switch (actionDef.name) {
          case 'settings.charging_station.ocpp_15_soap':
            url = registrationToken.ocpp15SOAPUrl;
            break;
          case 'settings.charging_station.ocpp_16_soap':
            url = registrationToken.ocpp16SOAPUrl;
            break;
          case 'settings.charging_station.ocpp_16_json':
            url = registrationToken.ocpp16JSONUrl;
            break;
        }
        Utils.copyToClipboard(url);
        this.messageService.showInfoMessage('settings.charging_station.url_copied');
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

  private createRegistrationToken() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.minWidth = '50vw';
    // Open
    const dialogRef = this.dialog.open(RegistrationTokenDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteToken(registrationToken: RegistrationToken) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.charging_station.registration_token_delete_title'),
      this.translateService.instant('settings.charging_station.registration_token_delete_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteRegistrationToken(registrationToken.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('settings.charging_station.registration_token_delete_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.charging_station.registration_token_delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.charging_station.registration_token_delete_error');
        });
      }
    });
  }

  private revokeToken(registrationToken: RegistrationToken) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.charging_station.registration_token_revoke_title'),
      this.translateService.instant('settings.charging_station.registration_token_revoke_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.revokeRegistrationToken(registrationToken.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('settings.charging_station.registration_token_revoke_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.charging_station.registration_token_revoke_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.charging_station.registration_token_revoke_error');
        });
      }
    });
  }
}
