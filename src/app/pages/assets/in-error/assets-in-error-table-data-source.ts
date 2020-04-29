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
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { AssetInError, AssetInErrorType, ErrorMessage } from 'app/types/InError';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import ChangeNotification from '../../../types/ChangeNotification';
import { AssetDialogComponent } from '../asset/asset.dialog.component';

@Injectable()
export class AssetsInErrorTableDataSource extends TableDataSource<AssetInError> {
  private isAdmin: boolean;
  private actions = {
    missing_site_area: [
      new TableEditAction().getActionDef(),
      new TableMoreAction([
        new TableDeleteAction().getActionDef(),
      ]).getActionDef(),
    ],
  };

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private dialogService: DialogService) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();

    this.setStaticFilters([{WithSiteArea: true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectAssets();
  }

  public loadDataImpl(): Observable<DataResult<AssetInError>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getAssetsInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((assets) => {
        this.formatErrorMessages(assets.result);
        // Ok
        observer.next(assets);
        observer.complete();
      }, (error) => {
        // No longer exists!
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
      rowFieldNameIdentifier: 'uniqueId',
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

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, asset: AssetInError) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showAssetDialog(asset);
        break;
      case ButtonAction.DELETE:
        this.deleteAsset(asset);
        break;
      default:
        super.rowActionTriggered(actionDef, asset);
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: AssetInErrorType.MISSING_SITE_AREA,
      value: `assets.errors.${AssetInErrorType.MISSING_SITE_AREA}.title`,
    });
    // Sort
    errorTypes.sort((errorType1, errorType2) => {
      if (errorType1.value < errorType2.value) {
        return -1;
      }
      if (errorType1.value > errorType2.value) {
        return 1;
      }
      return 0;
    });
    return [
      new SiteAreaTableFilter().getFilterDef(),
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];
  }

  buildTableDynamicRowActions(asset: AssetInError): TableActionDef[] {
    if (this.isAdmin && asset.errorCode) {
      // @ts-ignore
      return this.actions[asset.errorCode];
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

  private showAssetDialog(asset?: AssetInError) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (asset) {
      dialogConfig.data = asset.id;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AssetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteAsset(asset: AssetInError) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('assets.delete_title'),
      this.translateService.instant('assets.delete_confirm', {assetName: asset.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteAsset(asset.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('assets.delete_success', {assetName: asset.name});
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'assets.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'assets.delete_error');
        });
      }
    });
  }
}
