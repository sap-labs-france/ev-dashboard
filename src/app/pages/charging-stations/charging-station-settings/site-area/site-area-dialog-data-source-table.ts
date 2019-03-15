import {MatDialog, MatDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../../../shared/table/table-data-source';
import {Charger, SiteArea, TableActionDef, TableColumnDef, TableDef} from '../../../../common.types';
import {CentralServerService} from '../../../../services/central-server.service';
import {MessageService} from '../../../../services/message.service';
import {Utils} from '../../../../utils/Utils';
import {TableAction} from '../../../../shared/table/actions/table-action';
import {DialogService} from '../../../../services/dialog.service';
import {Injectable} from '@angular/core';
import {SiteAreaDialogComponent} from './site-area.dialog.component';

export class TableAssignAction implements TableAction {
  private action: TableActionDef = {
    id: 'add',
    type: 'button',
    icon: 'add',
    name: 'chargers.change_site_area',
    tooltip: 'general.tooltips.assign_site_area'
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}

@Injectable()
export class SiteAreaDataSource extends TableDataSource<SiteArea> {
  private charger: Charger;
  private dialogRef: MatDialogRef<SiteAreaDialogComponent>;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService) {
    super();
    // Set static filter
    this.setStaticFilters([
      {'WithSite': true, 'WithChargeBox': false}
    ]);
  }

  public loadData() {
    // Charger provided?
    if (this.charger) {
      // Yes: Get data
      this.centralServerService.getSiteAreas(this.getFilterValues(),
        this.getPaging(), this.getOrdering()).subscribe((siteArea) => {
        // Set number of records
        this.setNumberOfRecords(siteArea.count);
        // Update page length (number of sites is in User)
        this.updatePaginator();
        // Return sites
        this.getDataSubjet().next(siteArea.result);
        // Keep it
        this.setData(siteArea.result);
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
    } else {
      // Update page length
      this.updatePaginator();
      // Return sites
      this.getDataSubjet().next([]);
    }
  }

  /**
   * setDialogRef: Assign the reference of the dialog to be able to interact with it
   * dialogRef: MatDialogRef<SiteAreaDialogComponent>   */
  public setDialogRef(dialogRef: MatDialogRef<SiteAreaDialogComponent>) {
    this.dialogRef = dialogRef;
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: false
      },
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'site.name',
        name: 'sites.title',
        headerClass: 'col-50p',
        sorted: true,
        class: 'text-left',
        sortable: true
      },
      {
        id: 'name',
        name: 'site_areas.title',
        headerClass: 'col-50p',
        class: 'text-left',
        direction: 'asc',
        sortable: true
      },
      {
        id: 'site.address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'text-left'
      }
    ];
  }

  public setCharger(charger: Charger) {
    // Set charger
    this.charger = charger;
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableAssignAction().getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'add':
        this.dialogRef.close(this.getSelectedRows());
        break;
    }
  }

}
