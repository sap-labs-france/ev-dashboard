import { Component, EventEmitter, Output } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import { TranslateService } from "@ngx-translate/core";

import { BaseFilterDef, DropdownFilterDef, FilterHttpIDs } from "../../../types/Filters";
import { BaseTemplateFilter } from "../base-template-filter.component";

@Component({
  selector: 'app-dropdown-filter',
  template: `
  <mat-form-field [class]="filter.cssClass">
    <mat-select (selectionChange)="filterUpdated($event)" [(value)]="filter.currentValue"
      [placeholder]="filter.name | translate" multiple disableRipple>
      <mat-select-trigger>{{filter.label}}</mat-select-trigger>
      <mat-option *ngFor="let item of filter.items" [value]="item">{{item.value | translate}}</mat-option>
    </mat-select>
  </mat-form-field>
  `
})
export class DropdownFilterComponent extends BaseTemplateFilter{

  @Output('dataChanged') dataChanged: EventEmitter<BaseFilterDef> = new EventEmitter<BaseFilterDef>();

  public filter: DropdownFilterDef;

  public constructor(
    private translateService: TranslateService,
  ) {
    super();
    this.filter = {
      cssClass: '',
      currentValue: [],
      defaultValue: [],
      name: '',
      label: '',
      items: [],
      id: '',
      httpId: FilterHttpIDs.ISSUER,
    }
  }

  public reset(): void {
    this.filter.currentValue = this.filter.defaultValue;
    this.filter.label = '';
  };

  public setFilter(filter: DropdownFilterDef) {
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
}
