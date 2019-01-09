import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Company } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableRegisterAction } from 'app/shared/table/actions/table-register-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { CompanyLogoComponent } from '../formatters/company-logo.component';

@Injectable()
export class CompaniesDataSource extends TableDataSource<Company> {
  private readonly tableActionsRow: TableActionDef[];

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super();

    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableRegisterAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectCompany();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get the Companies
    // let companyLogos;
    // this.centralServerService.getCompanyLogos().subscribe((foundCompanyLogos) => {
    //   companyLogos = foundCompanyLogos;
      // Get the Companies
      this.centralServerService.getCompanies(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((companies) => {
        // Hide
        this.spinnerService.hide();
        // Update nbr records
        this.setNumberOfRecords(companies.count);
        // Update Paginator
        this.updatePaginator();
        // Notify
        this.getDataSubjet().next(companies.result);
        // Set the data
        this.setData(companies.result);
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'logo',
        name: 'companies.logo',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        isAngularComponent: true,
        angularComponentName: CompanyLogoComponent
      },
      {
        id: 'name',
        name: 'companies.name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableCreateAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showOcpiendpointDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showOcpiendpointDialog(rowItem);
        break;
      case 'delete':
        this._deleteOcpiendpoint(rowItem);
        break;
      case 'register':
        this._registerOcpiendpoint(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private _showOcpiendpointDialog(endpoint?: any) {
    // // Create the dialog
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.minWidth = '50vw';
    // if (endpoint) {
    //   dialogConfig.data = endpoint;
    // }
    // // Open
    // const dialogRef = this.dialog.open(EndpointDialogComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  private _deleteOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('ocpiendpoints.delete_title'),
      this.translateService.instant('ocpiendpoints.delete_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.delete_success', { 'name': ocpiendpoint.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.delete_error');
        });
      }
    });
  }

  private _registerOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('ocpiendpoints.register_title'),
      this.translateService.instant('ocpiendpoints.register_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.registerOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.register_success', { 'name': ocpiendpoint.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.register_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.register_error');
        });
      }
    });
  }
}
