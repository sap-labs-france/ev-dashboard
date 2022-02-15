import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

import { FilterHttpIDs } from "../../../types/Filters";
import { KeyValue } from "../../../types/GlobalType";
import { BaseFilter } from "../base-filter.component";
import { FiltersService } from "../filters.service";

export abstract class BaseDialogFilterComponent extends BaseFilter{

  public abstract httpId: FilterHttpIDs;
  public abstract currentValue: KeyValue[];
  public abstract defaultValue: KeyValue[];
  public abstract dialogComponent: any;
  public abstract dialogComponentData?: any;

  public constructor(
    public dialog: MatDialog,
    public filtersService: FiltersService
  ) {
    super();
  }

  public showDialogFilter(): void {
    const dialogConfig = new MatDialogConfig();
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Init button title
    dialogConfig.data = {
      validateButtonTitle: 'general.set_filter',
    };
    // Set dependent filters data value
    this.getDependentFilters();
    if (this.dialogComponentData) {
      Object.assign(dialogConfig.data, this.dialogComponentData);
    }
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(this.dialogComponent, dialogConfig);
    // Add sites
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        console.log(data);
        this.currentValue = data;
        this.label = data.map(t => t.value).join(', ');
        this.filtersService.filterUpdated(this.getCurrentValueAsKeyValue());
      }
    });
  }

  public reset(): void {
    this.label = '';
    this.currentValue = this.defaultValue;
    this.filtersService.filterUpdated(this.getCurrentValueAsKeyValue());
  }

  protected getCurrentValueAsKeyValue(): KeyValue[] {
    return [{
      key: this.httpId,
      value: this.currentValue.map(val => val.key).join('|')
    }]
  }

  protected getDependentFilters(): void {
    const staticFilterValues = this.filtersService.getFilterValues();
    if(!this.dialogComponentData){
      this.dialogComponentData = {
        staticFilter: { }
      };
    }
    this.dialogComponentData.staticFilter = staticFilterValues;
    console.log(this.dialogComponentData);
  }

}
