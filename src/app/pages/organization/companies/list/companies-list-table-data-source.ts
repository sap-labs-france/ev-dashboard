import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableCreateCompanyAction, TableCreateCompanyActionDef } from '../../../../shared/table/actions/companies/table-create-company-action';
import { TableDeleteCompanyAction, TableDeleteCompanyActionDef } from '../../../../shared/table/actions/companies/table-delete-company-action';
import { TableEditCompanyAction, TableEditCompanyActionDef } from '../../../../shared/table/actions/companies/table-edit-company-action';
import { TableViewCompanyAction, TableViewCompanyActionDef } from '../../../../shared/table/actions/companies/table-view-company-action';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import ChangeNotification from '../../../../types/ChangeNotification';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction } from '../../../../types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../types/Table';
import { User } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';
import { CompanyLogoFormatterCellComponent } from '../cell-components/company-logo-formatter-cell.component';
import { CompanyDialogComponent } from '../company/company.dialog.component';

@Injectable()
export class CompaniesListTableDataSource extends TableDataSource<Company> {
  private isAdmin = false;
  private editAction = new TableEditCompanyAction().getActionDef();
  private deleteAction = new TableDeleteCompanyAction().getActionDef();
  private viewAction = new TableViewCompanyAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private authorizationService: AuthorizationService) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.setStaticFilters([{ WithLogo: true }]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectCompanies();
  }

  public loadDataImpl(): Observable<DataResult<Company>> {
    return new Observable((observer) => {
      // get companies
      this.centralServerService.getCompanies(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((companies) => {
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
        class: 'col-8p p-0',
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
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.push(
        {
          id: 'createdOn',
          name: 'users.created_on',
          formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
          headerClass: 'col-15em',
          class: 'col-15em',
          sortable: true,
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
    }
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateCompanyAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(company: Company): TableActionDef[] {
    // Check if GPS is available
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(company.address);
    if (company.issuer) {
      if (this.isAdmin) {
        return [
          this.editAction,
          new TableMoreAction([
            openInMaps,
            this.deleteAction,
          ]).getActionDef(),
        ];
      }
    }
    return [
      this.viewAction,
      new TableMoreAction([
        openInMaps,
      ]).getActionDef(),
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case CompanyButtonAction.CREATE_COMPANY:
        if (actionDef.action) {
          (actionDef as TableCreateCompanyActionDef).action(CompanyDialogComponent, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, company: Company) {
    switch (actionDef.id) {
      case CompanyButtonAction.EDIT_COMPANY:
        if (actionDef.action) {
          (actionDef as TableEditCompanyActionDef).action(CompanyDialogComponent, company, this.dialog, this.refreshData.bind(this));
        }
        break;
      case CompanyButtonAction.VIEW_COMPANY:
        if (actionDef.action) {
          (actionDef as TableViewCompanyActionDef).action(CompanyDialogComponent, company, this.dialog, this.refreshData.bind(this));
        }
        break;
      case CompanyButtonAction.DELETE_COMPANY:
        if (actionDef.action) {
          (actionDef as TableDeleteCompanyActionDef).action(company, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(company.address.coordinates);
        }
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
    return [
      new IssuerFilter().getFilterDef(),
    ];
  }
}
