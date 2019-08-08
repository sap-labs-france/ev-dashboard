import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { SettingsOcpiEnpointsDetaislTableDataSource } from './settings-ocpi-endpoints-details-table-data-source';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="settingsOcpiEnpointsDetaislTableDataSource"></app-table>'
})

export class SettingsOcpiEnpointsDetailsComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: any;

  constructor(public settingsOcpiEnpointsDetaislTableDataSource: SettingsOcpiEnpointsDetaislTableDataSource) {
    super();
  }

  ngOnInit(): void {
    // Set
    this.settingsOcpiEnpointsDetaislTableDataSource.setEndpoint(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set
    this.settingsOcpiEnpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOcpiEnpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
