import { Component, EventEmitter, Output } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import { TranslateService } from "@ngx-translate/core";
import { DropdownFilterDef, FilterValue } from "types/Filters";
import { KeyValue } from "types/GlobalType";

import { BaseFilter } from "./base-filter.component";

@Component({
  selector: 'app-multiselect-dropdown-filter',
  template: `
  <mat-form-field [class]="filter.cssClass" style="padding-right: 10px;">
    <mat-select (selectionChange)="filterUpdated($event)" [(value)]="filter.currentValue"
      [placeholder]="filter.name | translate" multiple disableRipple>
      <mat-select-trigger>{{filter.label}}</mat-select-trigger>
      <mat-option *ngFor="let item of filter.items" [value]="item">{{item.value | translate}}</mat-option>
    </mat-select>
  </mat-form-field>
  `
})
export class MultiSelectDropdownFilterComponent extends BaseFilter{

  @Output('dataChanged') dataChanged: EventEmitter<{httpId: string, id: string, currentValue: FilterValue}>
  = new EventEmitter<{httpId: string, id: string, currentValue: FilterValue}>();

  public filter: DropdownFilterDef;

  public constructor(
    private translateService: TranslateService,
  ) {
    super();
    this.filter = {
      cssClass: '',
      currentValue: [],
      name: '',
      label: '',
      items: [],
      multiple: true,
      id: '',
      httpId: '',
    }
  }

  public reset(): void {
    this.filter.currentValue = [];
    this.filter.label = '';
  };

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
