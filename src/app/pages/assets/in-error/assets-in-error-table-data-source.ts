import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ComponentService } from 'services/component.service';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import { AssetsAuthorizations } from 'types/Authorization';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import {
  TableDeleteAssetAction,
  TableDeleteAssetActionDef,
} from '../../../shared/table/actions/assets/table-delete-asset-action';
import {
  TableEditAssetAction,
  TableEditAssetActionDef,
} from '../../../shared/table/actions/assets/table-edit-asset-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { AssetButtonAction } from '../../../types/Asset';
import { AssetInErrorDataResult } from '../../../types/DataResult';
import { AssetInError, AssetInErrorType, ErrorMessage } from '../../../types/InError';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { AssetDialogComponent } from '../asset/asset-dialog.component';

@Injectable()
export class AssetsInErrorTableDataSource extends TableDataSource<AssetInError> {
  private editAction = new TableEditAssetAction().getActionDef();
  private deleteAction = new TableDeleteAssetAction().getActionDef();
  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  private errorTypesFilter: TableFilterDef;
  private assetsAuthorizations: AssetsAuthorizations;
  private errorTypes = [
    {
      key: AssetInErrorType.MISSING_SITE_AREA,
      value: this.translateService.instant(
        `assets.errors.${AssetInErrorType.MISSING_SITE_AREA}.title`
      ),
    },
  ];

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([{ WithSiteArea: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<AssetInErrorDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getAssetsInError(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (assets) => {
            this.assetsAuthorizations = {
              canListSiteAreas: assets.canListSiteAreas,
              canCreate: assets.canCreate,
              canListSites: assets.canListSites,
            };
            this.formatErrorMessages(assets.result);
            observer.next(assets);
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
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    return [
      {
        id: 'name',
        name: 'assets.name',
        headerClass: 'col-45p',
        class: 'text-left col-40p',
        sortable: true,
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        headerClass: 'text-center',
        class: 'action-cell text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        class: 'col-35p text-danger',
        sortable: true,
        formatter: (value: string) => this.translateService.instant(`assets.errors.${value}.title`),
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public rowActionTriggered(actionDef: TableActionDef, asset: AssetInError) {
    switch (actionDef.id) {
      case AssetButtonAction.EDIT_ASSET:
        if (actionDef.action) {
          (actionDef as TableEditAssetActionDef).action(
            AssetDialogComponent,
            this.dialog,
            { dialogData: asset, authorizations: this.assetsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case AssetButtonAction.DELETE_ASSET:
        if (actionDef.action) {
          (actionDef as TableDeleteAssetActionDef).action(
            asset,
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
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([
      this.issuerFilter,
      this.siteFilter,
    ]).getFilterDef();
    this.errorTypesFilter = new ErrorTypeTableFilter(this.errorTypes).getFilterDef();
    const filters: TableFilterDef[] = [
      this.issuerFilter,
      this.siteFilter,
      this.siteAreaFilter,
      this.errorTypesFilter,
    ];
    return filters;
  }

  public buildTableDynamicRowActions(asset: AssetInError): TableActionDef[] {
    if (asset.errorCode) {
      switch (asset.errorCode) {
        case AssetInErrorType.MISSING_SITE_AREA:
          const rowActions: TableActionDef[] = [];
          if (asset.canUpdate) {
            rowActions.push(this.editAction);
          }
          if (asset.canDelete) {
            rowActions.push(new TableMoreAction([this.deleteAction]).getActionDef());
          }
          return rowActions;
      }
    }
    return [];
  }

  private formatErrorMessages(assetsInError: AssetInError[]) {
    assetsInError.forEach((assetInError) => {
      const path = `assets.errors.${assetInError.errorCode}`;
      const errorMessage: ErrorMessage = {
        title: `${path}.title`,
        titleParameters: {},
        description: `${path}.description`,
        descriptionParameters: {},
        action: `${path}.action`,
        actionParameters: {},
      };
      assetInError.errorMessage = errorMessage;
    });
  }
}
