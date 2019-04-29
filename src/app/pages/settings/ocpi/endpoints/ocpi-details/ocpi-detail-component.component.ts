import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CellContentTemplateComponent} from 'app/shared/table/cell-content-template/cell-content-template.component';
import {OcpiendpointDetailDataSource} from './ocpi-detail-data-source-table';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="ocpiEndpointDetailDataSource"></app-table>',
  providers: [
    OcpiendpointDetailDataSource
  ]
})

export class OcpiendpointDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: any;

  constructor(public ocpiEndpointDetailDataSource: OcpiendpointDetailDataSource) {
    super();
  }

  ngOnInit(): void {
    // Set
    this.ocpiEndpointDetailDataSource.setEndpoint(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set
    this.ocpiEndpointDetailDataSource.setEndpoint(this.row);
    // Reload data
    this.ocpiEndpointDetailDataSource.refreshOrLoadData().subscribe();
  }
}
