import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OcpiEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { SettingsOcpiEndpointsDetailsTableDataSource } from './settings-ocpi-endpoints-details-table-data-source';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="settingsOcpiEnpointsDetaislTableDataSource"></app-table>',
  providers: [SettingsOcpiEndpointsDetailsTableDataSource],
})

export class SettingsOcpiEnpointsDetailsComponent extends CellContentTemplateDirective implements OnChanges, OnInit {
  @Input() public row!: OcpiEndpoint;

  constructor(public settingsOcpiEnpointsDetaislTableDataSource: SettingsOcpiEndpointsDetailsTableDataSource) {
    super();
  }

  public ngOnInit(): void {
    this.refreshData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.refreshData();
  }

  private refreshData(): void {
    // Set
    this.settingsOcpiEnpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOcpiEnpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
