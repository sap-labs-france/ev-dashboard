import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AssetsDialogComponent } from '../../../../shared/dialogs/assets/assets-dialog.component';
import { TableAddAction } from '../../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../../shared/table/actions/table-remove-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { Asset, AssetType } from '../../../../types/Asset';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { SiteArea } from '../../../../types/SiteArea';
import {
  TableActionDef,
  TableColumnDef,
  TableDataSourceMode,
  TableDef,
} from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';

@Injectable()
export class SiteAreaAssetsDataSource extends TableDataSource<Asset> {
  private siteArea!: SiteArea;
  private addAction = new TableAddAction().getActionDef();
  private removeAction = new TableRemoveAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<Asset>> {
    return new Observable((observer) => {
      this.addAction.visible = this.siteArea.canAssignAssets;
      this.removeAction.visible = this.siteArea.canUnassignAssets;
      // Site Area provided?
      if (this.siteArea) {
        // Yes: Get data
        this.centralServerService
          .getAssets(this.buildFilterValues(), this.getPaging(), this.getSorting())
          .subscribe({
            next: (assets) => {
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
      } else {
        observer.next({
          count: 0,
          result: [],
        });
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    if (this.getMode() === TableDataSourceMode.READ_WRITE) {
      return {
        class: 'table-dialog-list',
        rowSelection: {
          enabled: true,
          multiple: true,
        },
        search: {
          enabled: true,
        },
      };
    }
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      search: {
        enabled: false,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'assets.titles',
        headerClass: 'col-100p',
        class: 'text-left col-100p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'dynamicAsset',
        name: 'assets.dynamic_asset',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (dynamicAsset: boolean) =>
          Utils.displayYesNo(this.translateService, dynamicAsset),
      },
      {
        id: 'assetType',
        name: 'assets.asset_type',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (assetType: AssetType) => {
          switch (assetType) {
            case AssetType.PRODUCTION:
              return this.translateService.instant('assets.produce');
            case AssetType.CONSUMPTION:
              return this.translateService.instant('assets.consume');
            case AssetType.CONSUMPTION_AND_PRODUCTION:
              return this.translateService.instant('assets.consume_and_produce');
          }
        },
      },
    ];
  }

  public setSiteArea(siteArea: SiteArea) {
    // Set static filter
    this.setStaticFilters([{ SiteAreaID: siteArea.id }]);
    // Set user
    this.siteArea = siteArea;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.getMode() === TableDataSourceMode.READ_WRITE) {
      if (this.siteArea.canAssignAssets) {
        tableActionsDef.push(this.addAction);
      }
      if (this.siteArea.canUnassignAssets) {
        tableActionsDef.push(this.removeAction);
      }
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.ADD:
        this.showAddAssetsDialog();
        break;

      // Remove
      case ButtonAction.REMOVE:
        // Empty?
        if (Utils.isEmptyArray(this.getSelectedRows())) {
          this.messageService.showErrorMessage(
            this.translateService.instant('general.select_at_least_one_record')
          );
        } else {
          // Confirm
          this.dialogService
            .createAndShowYesNoDialog(
              this.translateService.instant('site_areas.remove_assets_title'),
              this.translateService.instant('site_areas.remove_assets_confirm')
            )
            .subscribe((response) => {
              if (response === ButtonAction.YES) {
                this.removeAssets(this.getSelectedRows().map((row) => row.id));
              }
            });
        }
        break;
    }
  }

  public showAddAssetsDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        WithNoSiteArea: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(AssetsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((assets) => this.addAssets(assets));
  }

  private removeAssets(assetIDs: string[]) {
    // Remove
    this.centralServerService.removeAssetsFromSiteArea(this.siteArea.id, assetIDs).subscribe({
      next: (response) => {
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            this.translateService.instant('site_areas.remove_assets_success')
          );
          this.refreshData().subscribe();
          this.clearSelectedRows();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            this.translateService.instant('site_areas.remove_assets_error')
          );
        }
      },
      error: (error) => {
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'site_areas.remove_assets_error'
        );
      },
    });
  }

  private addAssets(assets: Asset[]) {
    if (!Utils.isEmptyArray(assets)) {
      // Get the IDs
      const assetIDs = assets.map((asset) => asset.key);
      // Add
      this.centralServerService.addAssetsToSiteArea(this.siteArea.id, assetIDs).subscribe({
        next: (response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage(
              this.translateService.instant('site_areas.update_assets_success')
            );
            this.refreshData().subscribe();
            this.clearSelectedRows();
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              this.translateService.instant('site_areas.update_error')
            );
          }
        },
        error: (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'site_areas.update_error'
          );
        },
      });
    }
  }
}
