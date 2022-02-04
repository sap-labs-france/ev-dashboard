import { Component, Inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DropdownFilterDef } from "types/Filters";

import { BaseFilter } from "./base-filter.component";

@Component({
  selector: 'app-single-dropdown-filter',
  template: `
  <mat-form-field>
    <mat-select (selectionChange)="filterUpdated()" [(value)]="filter.currentValue"
      [placeholder]="filter.name | translate" multiple disableRipple>
      <mat-select-trigger>{{filter.label}}</mat-select-trigger>
      <mat-option *ngFor="let item of filter.items" [value]="item">{{item.value | translate}}</mat-option>
    </mat-select>
  </mat-form-field>
  `
})
export class SingleSelectDropdownFilterComponent extends BaseFilter {

  public filter: DropdownFilterDef;

  public constructor(
    private translateService: TranslateService
  ) {
    super();
  }

  public initFilter(filter: DropdownFilterDef): void {
  }

  public reset(): void {
  };

  public filterUpdated(): void {
  }
}
