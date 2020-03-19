import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Company, CompanyLogo } from 'app/types/Company';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import ChangeNotification from '../../../../types/ChangeNotification';
import { CompanyLogoFormatterCellComponent } from '../cell-components/company-logo-formatter-cell.component';
import { CompanyDialogComponent } from '../company/company.dialog.component';

@Injectable()
export class CompaniesListTableDataSource extends TableDataSource<Company> {
  private isAdmin = false;
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService) {
    super(spinnerService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.setStaticFilters([{WithLogo: true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectCompanies();
  }

  public loadDataImpl(): Observable<DataResult<Company>> {
    return new Observable((observer) => {
      // get companies
      this.centralServerService.getCompanies(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((companies) => {
        // lookup for logo otherwise assign default
        for (const company of companies.result) {
          if (!company.logo) {
            company.logo = CompanyLogo.NO_LOGO;
          }
        }
        // Ok
        observer.next(companies);
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
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'logo',
        name: 'companies.logo',
        headerClass: 'text-center col-8p',
        class: 'col-8p',
        isAngularComponent: true,
        angularComponent: CompanyLogoFormatterCellComponent,
      },
      {
        id: 'name',
        name: 'companies.name',
        headerClass: 'col-50p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef,
      ];
    } else {
      return tableActionsDef;
    }
  }

  public buildTableDynamicRowActions(company: Company) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // check if GPs are available
    openInMaps.disabled = (company && company.address && company.address.coordinates
      && company.address.coordinates.length === 2) ? false : true;
    if (this.isAdmin) {
      return [
        this.editAction,
        new TableMoreAction([
          openInMaps,
          this.deleteAction,
        ]).getActionDef(),
      ];
    } else {
      return [
        this.viewAction,
        new TableMoreAction([
          openInMaps,
        ]).getActionDef(),
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showCompanyDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Company) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showCompanyDialog(rowItem);
        break;
      case ButtonAction.DELETE:
        this.deleteCompany(rowItem);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        this.showPlace(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
    ];
  }

  private showPlace(company: Company) {
    if (company && company.address && company.address.coordinates) {
      window.open(`http://maps.google.com/maps?q=${company.address.coordinates[1]},${company.address.coordinates[0]}`);
    }
  }

  private showCompanyDialog(company?: Company) {
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
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteCompany(company: Company) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('companies.delete_title'),
      this.translateService.instant('companies.delete_confirm', {companyName: company.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteCompany(company.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('companies.delete_success', {companyName: company.name});
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'companies.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'companies.delete_error');
        });
      }
    });
  }
}
