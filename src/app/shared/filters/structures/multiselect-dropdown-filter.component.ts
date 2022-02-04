import { Component, Inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DropdownFilterDef } from "types/Filters";

import { BaseFilter } from "./base-filter.component";

@Component({
  selector: 'app-multi-dropdown-filter',
  template: `
  <mat-form-field>
  <mat-select (selectionChange)="filterUpdated()" [(value)]="filter.currentValue"
      [placeholder]="filter.name | translate">
      <mat-option *ngFor="let item of filter.items" [value]="item.key">{{item.value | translate}}
      </mat-option>
    </mat-select>
  </mat-form-field>
  `
})
export class MultiSelectDropdownFilterComponent extends BaseFilter {

  public filter: DropdownFilterDef;

  public constructor(
    private translateService: TranslateService
  ) {
    super();
    this.filter = {
      id: '',
      name: '',
      currentValue: [],
      multiple: false,
      items: []
    };
  }

  public initFilter(filter: DropdownFilterDef): void {
    this.filter = {...filter};
  }

  public reset(): void {
  };

  public filterUpdated(): void {
  }
}
