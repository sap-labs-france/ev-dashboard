import { Component, EventEmitter, Output } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { TranslateService } from "@ngx-translate/core";
import { takeWhile } from "rxjs/operators";

import { BaseFilterDef, DialogFilterDef, FilterHttpIDs } from "../../../types/Filters";
import { BaseTemplateFilter } from "./base-template-filter.component";

@Component({
  selector: 'app-dialog-filter',
  template: `
  <mat-form-field [class]="filter.cssClass" style="padding-right: 10px;">
    <input (click)="showDialogFilter()" [placeholder]="filter.name | translate"
      [value]="filter.currentValue"
      class="form-field-popup" matInput readonly=true type="text" />
    <button mat-icon-button matSuffix (click)="resetDialogFilter()" aria-label="Clear">
      <mat-icon>clear</mat-icon>
    </button>
  </mat-form-field>
  `
})
export class DialogFilterComponent extends BaseTemplateFilter{

  @Output('dataChanged') dataChanged: EventEmitter<BaseFilterDef> = new EventEmitter<BaseFilterDef>();

  public filter: DialogFilterDef;
  alive: boolean;

  public constructor(
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    super();
    this.filter = {
      cssClass: '',
      currentValue: [],
      name: '',
      label: '',
      multiple: true,
      id: '',
      httpId: FilterHttpIDs.SITE,
      dialogComponent: null,
    }
  }

  public reset(): void {
    this.filter.currentValue = [];
    this.filter.label = '';
  };

  public setFilter(filter: DialogFilterDef) {
    Object.assign(this.filter, filter);
  }

  public filterUpdated(event: MatSelectChange): void {
    const labels = event.value.map(val => val.value);
    this.filter.label = labels.map(label => this.translateService.instant(label)).join(' , ');
    this.dataChanged.emit({
      id: this.filter.id,
      httpId: this.filter.httpId,
      currentValue: this.filter.currentValue
    });
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
    if (this.filter.dialogComponentData) {
      Object.assign(dialogConfig.data, this.filter.dialogComponentData);
    }
    // if (filterDef.cleared) {
    //   dialogConfig.data.cleared = true;
    //   filterDef.cleared = false;
    // }
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(this.filter.dialogComponent, dialogConfig);
    // Add sites
    dialogRef.afterClosed().pipe(takeWhile(() => this.alive)).subscribe((data) => {
      if (data) {
        this.filter.currentValue = data;
        this.dataChanged.emit({
          id: this.filter.id,
          httpId: this.filter.httpId,
          currentValue: this.filter.currentValue,
        });
      }
    });
  }

  public resetDialogFilter(): void {
    console.log('Reset dialog filter');
  }
}
