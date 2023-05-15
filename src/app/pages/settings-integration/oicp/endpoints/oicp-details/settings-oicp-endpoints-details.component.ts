import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';
import { SettingsOicpEndpointsDetailsTableDataSource } from './settings-oicp-endpoints-details-table-data-source';

@Component({
  template: '<app-table [dataSource]="settingsOicpEndpointsDetaislTableDataSource"></app-table>',
  providers: [SettingsOicpEndpointsDetailsTableDataSource],
})
export class SettingsOicpEndpointsDetailsComponent
  extends CellContentTemplateDirective
  implements OnChanges, OnInit {
  @Input() public row!: OicpEndpoint;

  public constructor(
    public settingsOicpEndpointsDetaislTableDataSource: SettingsOicpEndpointsDetailsTableDataSource
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
    this.settingsOicpEndpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOicpEndpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
