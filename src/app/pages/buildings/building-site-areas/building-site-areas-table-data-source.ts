import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { TableAddAction } from 'app/shared/table/actions/table-add-action';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Building } from 'app/types/Building';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { SiteArea } from 'app/types/SiteArea';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

@Injectable()
export class BuildingSiteAreasDataSource extends TableDataSource<SiteArea> {
  private building!: Building;

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService) {
    super(spinnerService);
  }

  public loadDataImpl(): Observable<DataResult<SiteArea>> {
    return new Observable((observer) => {
      // building provided?
      if (this.building) {
        const filterValues = this.buildFilterValues();
        filterValues['WithSite'] = 'true';
        // Yes: Get data
        this.centralServerService.getSiteAreas(filterValues,
          this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Ok
          observer.next(siteAreas);
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
    if (this.building && this.authorizationService.isAdmin()) {
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
        name: 'site_areas.titles',
        headerClass: 'col-35p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site.name',
        name: 'sites.site',
        headerClass: 'col-50p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
    ];
  }

  public setBuilding(building: Building) {
    // Set static filter
    this.setStaticFilters([
      {BuildingID: building.id},
    ]);
    // Set building
    this.building = building;
    this.initDataSource(true);
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.building && this.authorizationService.isAdmin()) {
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
        this.showAddSiteAreasDialog();
        break;
      // Remove
      case ButtonAction.REMOVE:
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('site_areas.remove_chargers_title'),
            this.translateService.instant('site_areas.remove_chargers_confirm'),
          ).subscribe((response) => {
            // Check
            if (response === ButtonType.YES) {
              // Remove
              this.removeSiteAreas(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
    }
  }

  public showAddSiteAreasDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        WithSite: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(SiteAreasDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((siteAreas) => this.addSiteAreas(siteAreas));
  }

  private removeSiteAreas(chargerIDs: string[]) {
  }

  private addSiteAreas(siteAreas: SiteArea[]) {
  }
}
