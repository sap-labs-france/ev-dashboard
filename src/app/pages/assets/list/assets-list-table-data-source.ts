import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Asset, AssetButtonAction, AssetImage } from 'app/types/Asset';
import ChangeNotification from 'app/types/ChangeNotification';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { TableCreateAssetAction } from '../table-actions/table-create-asset-action';
import { TableDeleteAssetAction } from '../table-actions/table-delete-asset-action';
import { TableEditAssetAction } from '../table-actions/table-edit-asset-action';
import { TableViewAssetAction } from '../table-actions/table-view-asset-action';

@Injectable()
export class AssetsListTableDataSource extends TableDataSource<Asset> {
  private isAdmin = false;
  private editAction = new TableEditAssetAction().getActionDef();
  private deleteAction = new TableDeleteAssetAction().getActionDef();
  private displayAction = new TableViewAssetAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.setStaticFilters([{WithLogo: true, WithSiteArea: true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectAssets();
  }

  public loadDataImpl(): Observable<DataResult<Asset>> {
    return new Observable((observer) => {
      // get assets
      this.centralServerService.getAssets(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((assets) => {
        // lookup for image otherwise assign default
        for (const asset of assets.result) {
          if (!asset.image) {
            asset.image = AssetImage.NO_IMAGE;
          }
        }
        // Ok
        observer.next(assets);
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
        id: 'name',
        name: 'assets.name',
        headerClass: 'col-40p',
        class: 'text-left col-40p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        headerClass: 'col-50p',
        class: 'col-50p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAssetAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(asset: Asset): TableActionDef[] {
    const actions = [];
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsGPSCoordinates(asset.coordinates);
    if (this.isAdmin) {
      actions.push(this.editAction);
      actions.push(new TableMoreAction([
        openInMaps,
        this.deleteAction,
      ]).getActionDef());
    } else {
      actions.push(this.displayAction);
      actions.push(openInMaps);
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case AssetButtonAction.CREATE_ASSET:
        if (actionDef.action) {
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, asset: Asset) {
    switch (actionDef.id) {
      case AssetButtonAction.VIEW_ASSET:
      case AssetButtonAction.EDIT_ASSET:
        if (actionDef.action) {
          actionDef.action(asset, this.dialog, this.refreshData.bind(this));
        }
        break;
      case AssetButtonAction.DELETE_ASSET:
        if (actionDef.action) {
          actionDef.action(asset, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(asset.coordinates);
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
    return [];
  }
}
