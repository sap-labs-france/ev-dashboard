import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { Observable } from 'rxjs';
import {
  DataResult,
  RegistrationToken,
  SubjectInfo,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef
} from '../../../../common.types';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { TableRevokeAction } from '../../../../shared/table/actions/table-revoke-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';
import { RegistrationTokenStatusComponent } from './registration-token-status.component';
import { RegistrationTokenUrlComponent } from './registration-token-url.component';
import { RegistrationTokenComponent } from './registration-token.component';

@Injectable()
export class RegistrationTokensTableDataSource extends TableDataSource<RegistrationToken> {
  private deleteAction = new TableDeleteAction().getActionDef();
  private revokeAction = new TableRevokeAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<RegistrationToken>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getRegistrationTokens(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((tokens) => {
        // Ok
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
        enabled: false
      },
      hasDynamicRowAction: true
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [
      {
        id: 'status',
        name: 'users.status',
        isAngularComponent: true,
        angularComponent: RegistrationTokenStatusComponent,
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'd-none d-xl-table-cell col-15p',
        class: 'd-none d-xl-table-cell col-15p',
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        sorted: true
      },
      {
        id: 'expirationDate',
        name: 'general.expired_on',
        formatter: (expirationDate) => this.datePipe.transform(expirationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true
      },
      {
        id: 'revocationDate',
        name: 'general.revoked_on',
        formatter: (revocationDate) => this.datePipe.transform(revocationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true
      },
      {
        id: 'siteAreaID',
        name: 'site_areas.title',
        formatter: (siteAreaID, token) => {
          if (token.siteArea) {
            return token.siteArea.name;
          }
        },
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true
      },
      {
        id: 'ocpp15Url',
        name: 'settings.charging_station.url',
        headerClass: 'col-10p text-center',
        class: 'col-10p',
        isAngularComponent: true,
        angularComponent: RegistrationTokenUrlComponent,
      }];
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  public buildTableDynamicRowActions(registrationToken: RegistrationToken): TableActionDef[] {
    return [
      this.revokeAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case 'create':
        this.createRegistrationToken();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'revoke':
        this.revokeToken(rowItem);
        break;
      case 'delete':
        this.deleteToken(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
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
    const dialogRef = this.dialog.open(RegistrationTokenComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteToken(registrationToken: RegistrationToken) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.charging_station.registration_token_delete_title'),
      this.translateService.instant('settings.charging_station.registration_token_delete_confirm')
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteRegistrationToken(registrationToken.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
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
      this.translateService.instant('settings.charging_station.registration_token_revoke_confirm')
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.revokeRegistrationToken(registrationToken.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
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
