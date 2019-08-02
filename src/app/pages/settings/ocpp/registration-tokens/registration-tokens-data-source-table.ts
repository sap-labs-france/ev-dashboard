import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { Observable } from 'rxjs';
import {
  RegistrationToken,
  SubjectInfo,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef,
  User
} from '../../../../common.types';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Injectable()
export class RegistrationTokensDataSourceTable extends TableDataSource<RegistrationToken> {
  private currentUser: User;
  private siteAreaID: string;

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
    // Store the current user
    this.currentUser = this.centralServerService.getLoggedUser();
  }

  public setSiteArea(id: string) {
    this.siteAreaID = id;
    this.setStaticFilters([
      {'siteAreaID': id}
    ]);
    this.refreshData().subscribe();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getRegistrationTokens(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
        // Ok
        observer.next(users);
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
      hasDynamicRowAction: false
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [
      {
        id: 'id',
        name: 'general.id',
        headerClass: 'd-none d-xl-table-cell col-25p',
        class: 'd-none d-xl-table-cell col-25p',
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn) => this.datePipe.transform(createdOn),
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sortable: true
      },
      {
        id: 'expirationDate',
        name: 'general.expired_on',
        formatter: (expirationDate) => this.datePipe.transform(expirationDate),
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sorted: true,
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
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
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
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.ocpp.registration_token_creation_title'),
      this.translateService.instant('settings.ocpp.registration_token_creation_confirm')
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();

        this.centralServerService.createRegistrationToken({
          siteAreaID: this.siteAreaID
        }).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('settings.ocpp.registration_token_creation_success');
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.ocpp.registration_token_creation_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.ocpp.registration_token_creation_error');
        });
      }
    });
  }
}
