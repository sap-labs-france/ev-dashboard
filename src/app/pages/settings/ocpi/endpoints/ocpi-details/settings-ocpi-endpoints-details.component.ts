import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { OcpiEndpoint } from '../../../../../common.types';
import { SettingsOcpiEndpointsDetailsTableDataSource } from './settings-ocpi-endpoints-details-table-data-source';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="settingsOcpiEnpointsDetaislTableDataSource"></app-table>',
  providers: [ SettingsOcpiEndpointsDetailsTableDataSource ],
})

export class SettingsOcpiEnpointsDetailsComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: OcpiEndpoint;

  constructor(public settingsOcpiEnpointsDetaislTableDataSource: SettingsOcpiEndpointsDetailsTableDataSource) {
    super();
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshData();
  }

  private refreshData(): void {
    // Set
    this.settingsOcpiEnpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOcpiEnpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
