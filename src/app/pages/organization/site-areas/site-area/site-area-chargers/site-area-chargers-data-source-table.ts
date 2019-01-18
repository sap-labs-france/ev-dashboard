import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from 'app/shared/table/table-data-source';
import {Charger, TableActionDef, TableColumnDef, TableDef, User, SiteArea} from 'app/common.types';
import {CentralServerService} from 'app/services/central-server.service';
import {ChargersDialogComponent} from 'app/shared/dialogs/chargers/chargers-dialog-component';
import {MessageService} from 'app/services/message.service';
import {Utils} from 'app/utils/Utils';
import {TableAddAction} from 'app/shared/table/actions/table-add-action';
import {TableRemoveAction} from 'app/shared/table/actions/table-remove-action';
import {DialogService} from 'app/services/dialog.service';
import {Constants} from 'app/utils/Constants';
import {Injectable} from '@angular/core';

@Injectable()
export class SiteAreaChargersDataSource extends TableDataSource<Charger> {
  private siteArea: SiteArea;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService) {
    super();
  }

  public loadData() {
    // siteArea provided?
    if (this.siteArea) {
      // Yes: Get data
      this.centralServerService.getChargers(this.getFilterValues(),
        this.getPaging(), this.getOrdering()).subscribe((chargers) => {
        // Set number of records
        this.setNumberOfRecords(chargers.count);
        this.setData(chargers.result);
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
    } else {
      this.updatePaginator();
        this.setData([]);
    }
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'chargers.chargers',
        headerClass: 'col-35p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.vendor',
        headerClass: 'col-50p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true
      }
    ];
  }

  public setSiteArea(siteArea: SiteArea) {
    // Set static filter
    this.setStaticFilters([
      {'SiteAreaID': siteArea.id}
    ]);
    // Set user
    this.siteArea = siteArea;
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableAddAction().getActionDef(),
      new TableRemoveAction().getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'add':
        this._showAddChargersDialog();
        break;

      // Remove
      case 'remove':
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.dialog,
            this.translateService.instant('site_areas.remove_chargers_title'),
            this.translateService.instant('site_areas.remove_chargers_confirm')
          ).subscribe((response) => {
            // Check
            if (response === Constants.BUTTON_TYPE_YES) {
              // Remove
              this._removeChargers(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
    }
  }

  public _showAddChargersDialog() {
    const dialogConfig = new MatDialogConfig();
    // Set data
    dialogConfig.data = {
      withNoSiteArea: true,
      tableDef: {
        class: 'table-dialog-list',
        rowSelection: {
          enabled: true,
          multiple: true
        },
        search: {
          enabled: true
        }
      }
    }
    // Show
    const dialogRef = this.dialog.open(ChargersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe(chargers => this._addChargers(chargers));
  }

  private _removeChargers(chargerIDs) {
    // Yes: Update
    this.centralServerService.removeChargersFromSiteArea(this.siteArea.id, chargerIDs).subscribe(response => {
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('site_areas.remove_chargers_success'));
        // Refresh
        this.loadData();
        // Clear selection
        this.clearSelectedRows()
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('site_areas.remove_chargers_error'));
      }
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        this.translateService.instant('site_areas.remove_chargers_error'));
    });
  }

  private _addChargers(chargers) {
    // Check
    if (chargers && chargers.length > 0) {
      // Get the IDs
      const chargerIDs = chargers.map((charger) => charger.key);
      // Yes: Update
      this.centralServerService.addChargersToSiteArea(this.siteArea.id, chargerIDs).subscribe(response => {
        // Ok?
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          // Ok
          this.messageService.showSuccessMessage(this.translateService.instant('site_areas.update_chargers_success'));
          // Refresh
          this.loadData();
          // Clear selection
          this.clearSelectedRows()
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, this.translateService.instant('site_areas.update_error'));
        }
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('site_areas.update_error'));
      });
    }
  }
}
