import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { OicpEndpoint } from '../../../../../types/oicp/OICPEndpoint';
import { SettingsOicpEndpointsDetailsTableDataSource } from './settings-oicp-endpoints-details-table-data-source';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="settingsOicpEnpointsDetaislTableDataSource"></app-table>',
  providers: [SettingsOicpEndpointsDetailsTableDataSource],
})

export class SettingsOicpEnpointsDetailsComponent extends CellContentTemplateDirective implements OnChanges, OnInit {
  @Input() public row!: OicpEndpoint;

  constructor(public settingsOicpEnpointsDetaislTableDataSource: SettingsOicpEndpointsDetailsTableDataSource) {
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
    this.settingsOicpEnpointsDetaislTableDataSource.setEndpoint(this.row);
    // Reload data
    this.settingsOicpEnpointsDetaislTableDataSource.refreshData(false).subscribe();
  }
}
