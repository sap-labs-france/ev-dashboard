import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { SettingsOcpiEndpointsDetailsTableDataSource } from './settings-ocpi-endpoints-details-table-data-source';

@Component({
  template: '<app-table [dataSource]="settingsOcpiEndpointsDetaislTableDataSource"></app-table>',
  providers: [SettingsOcpiEndpointsDetailsTableDataSource],
})
export class SettingsOcpiEndpointsDetailsComponent
  extends CellContentTemplateDirective
  implements OnChanges, OnInit {
  @Input() public row!: OCPIEndpoint;

  public constructor(
    public settingsOcpiEndpointsDetaislTableDataSource: SettingsOcpiEndpointsDetailsTableDataSource
  ) {
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
    this.settingsOcpiEndpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOcpiEndpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
