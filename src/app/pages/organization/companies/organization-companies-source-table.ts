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
import { AuthorizationService } from 'app/services/authorization-service';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { CompanyLogoComponent } from '../formatters/company-logo.component';
import { CompanyDialogComponent } from './company/company.dialog.component';

@Injectable()
export class OrganizationCompaniesDataSource extends TableDataSource<Company> {
  public isAdmin = false;

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService
    ) {
    super();
    this.setStaticFilters([{'WithLogo': true}]);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectCompany();
  }

  public loadData() {
    // show
    this.spinnerService.show();

    // get companies
    this.centralServerService.getCompanies(this.getFilterValues(), this.getPaging(), this.getOrdering()).subscribe((companies) => {
        // Hide
        this.spinnerService.hide();
        // Update nbr records
        this.setNumberOfRecords(companies.count);
        // Update Paginator
        this.updatePaginator();
        // Notify
        this.getDataSubjet().next(companies.result);
        // lookup for logo otherwise assign default
        for (let i = 0; i < companies.result.length; i++) {
          if (!companies.result[i].logo) {
            companies.result[i].logo = Constants.COMPANY_NO_LOGO;
          }
        }

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
        enabled: true
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'logo',
        name: 'companies.logo',
        headerClass: 'col-10p',
        class: 'col-10p',
        isAngularComponent: true,
        angularComponentName: CompanyLogoComponent
      },
      {
        id: 'name',
        name: 'companies.name',
        // headerClass: 'col-30p',
        class: 'text-left',
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
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef()
      ];
    } else {
      return [];
    }
  }

  public getTableRowActions(): TableActionDef[] {
    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef()
      ];
    }
  }

  specificRowActions(company: Company) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();

    // check if GPs are available
    openInMaps.disabled = (company && company.address && company.address.latitude && company.address.longitude ) ? false : true;

    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        openInMaps,
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        openInMaps
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showCompanyDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
      case 'view':
        this._showCompanyDialog(rowItem);
        break;
      case 'delete':
        this._deleteCompany(rowItem);
        break;
      case 'open_in_maps':
        this._showPlace(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      // new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private _showPlace(rowItem) {
    if (rowItem && rowItem.address && rowItem.address.longitude && rowItem.address.latitude) {
      window.open(`http://maps.google.com/maps?q=${rowItem.address.latitude},${rowItem.address.longitude}`);
    }
  }

  private _showCompanyDialog(company?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (company) {
      dialogConfig.data = company.id;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(CompanyDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  private _deleteCompany(company) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('companies.delete_title'),
      this.translateService.instant('companies.delete_confirm', { 'companyName': company.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteCompany(company.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('companies.delete_success', { 'companyName': company.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'companies.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'companies.delete_error');
        });
      }
    });
  }
}
