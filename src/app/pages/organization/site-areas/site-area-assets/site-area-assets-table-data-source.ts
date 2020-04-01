import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AssetsDialogComponent } from 'app/shared/dialogs/assets/assets-dialog.component';
import { TableAddAction } from 'app/shared/table/actions/table-add-action';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Asset } from 'app/types/Asset';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

@Injectable()
export class SiteAreaAssetsDataSource extends TableDataSource<Asset> {
  private siteArea!: SiteArea;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<Asset>> {
    return new Observable((observer) => {
      // siteArea provided?
      if (this.siteArea) {
        // Yes: Get data
        this.centralServerService.getAssets(this.buildFilterValues(),
          this.getPaging(), this.getSorting()).subscribe((assets) => {
          // Ok
          observer.next(assets);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
      } else {
        // Ok
        observer.next({
          count: 0,
          result: [],
        });
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    if (this.siteArea && this.authorizationService.isAdmin()) {
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
        headerClass: 'col-35p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-35p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-35p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
    ];
  }

  public setSiteArea(siteArea: SiteArea) {
    // Set static filter
    this.setStaticFilters([
      {SiteAreaID: siteArea.id},
    ]);
    // Set user
    this.siteArea = siteArea;
    this.initDataSource(true);
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.siteArea && this.authorizationService.isAdmin()) {
      return [
        new TableAddAction().getActionDef(),
        new TableRemoveAction().getActionDef(),
        ...tableActionsDef,
      ];
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
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('site_areas.remove_assets_title'),
            this.translateService.instant('site_areas.remove_assets_confirm'),
          ).subscribe((response) => {
            // Check
            if (response === ButtonType.YES) {
              // Remove
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
    // Yes: Update
    this.centralServerService.removeAssetsFromSiteArea(this.siteArea.id, assetIDs).subscribe((response) => {
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('site_areas.remove_assets_success'));
        // Refresh
        this.refreshData().subscribe();
        // Clear selection
        this.clearSelectedRows();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('site_areas.remove_assets_error'));
      }
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site_areas.remove_assets_error');
    });
  }

  private addAssets(assets: Asset[]) {
    // Check
    if (assets && assets.length > 0) {
      // Get the IDs
      const assetIDs = assets.map((asset) => asset.key);
      // Yes: Update
      this.centralServerService.addAssetsToSiteArea(this.siteArea.id, assetIDs).subscribe((response) => {
        // Ok?
        if (response.status === RestResponse.SUCCESS) {
          // Ok
          this.messageService.showSuccessMessage(this.translateService.instant('site_areas.update_assets_success'));
          // Refresh
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, this.translateService.instant('site_areas.update_error'));
        }
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'site_areas.update_error');
      });
    }
  }
}
