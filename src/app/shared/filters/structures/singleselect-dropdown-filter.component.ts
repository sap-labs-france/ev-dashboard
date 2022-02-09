import { Component, Inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DropdownFilterDef } from "types/Filters";

import { BaseTemplateFilter } from "./base-template-filter.component";

@Component({
  selector: 'app-single-dropdown-filter',
  template: `
  <div [class]="filter.cssClass">
    <mat-form-field>
      <mat-select (selectionChange)="filterUpdated()" [(value)]="filter.currentValue"
        [placeholder]="filter.name | translate">
        <mat-option *ngFor="let item of filter.items" [value]="item.key">{{item.value | translate}}
        </mat-option>
      </mat-select>
    </mat-form-field>
  </div>
  `
})
export class SingleSelectDropdownFilterComponent extends BaseTemplateFilter {

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
