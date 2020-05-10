import { Company, CompanyButtonAction, CompanyLogo } from 'app/types/Company';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';

import { AuthorizationService } from 'app/services/authorization.service';
import { ButtonAction } from 'app/types/GlobalType';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../../types/ChangeNotification';
import { CompanyLogoFormatterCellComponent } from '../cell-components/company-logo-formatter-cell.component';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateCompanyAction } from 'app/shared/table/actions/table-create-company-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteCompanyAction } from 'app/shared/table/actions/table-delete-company-action';
import { TableEditCompanyAction } from 'app/shared/table/actions/table-edit-company-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewCompanyAction } from 'app/shared/table/actions/table-view-company-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

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
    private authorizationService: AuthorizationService) {
    super(spinnerService, translateService);
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
        new TableCreateCompanyAction().getActionDef(),
        ...tableActionsDef,
      ];
    } else {
      return tableActionsDef;
    }
  }

  public buildTableDynamicRowActions(company: Company): TableActionDef[] {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(company.address);
    if (this.isAdmin) {
      return [
        this.editAction,
        new TableMoreAction([
          openInMaps,
          this.deleteAction,
        ]).getActionDef(),
      ];
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
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, company: Company) {
    switch (actionDef.id) {
      case CompanyButtonAction.EDIT_COMPANY:
      case CompanyButtonAction.VIEW_COMPANY:
        if (actionDef.action) {
          actionDef.action(company, this.dialog, this.refreshData.bind(this));
        }
        break;
      case CompanyButtonAction.DELETE_COMPANY:
        if (actionDef.action) {
          actionDef.action(company, this.dialogService, this.translateService, this.messageService,
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
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
    ];
  }
}
