import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { OcpiDetailTableDataSource } from './ocpi-detail-table-data-source';

@Component({
  template: '<app-table class="endpoint-details" [dataSource]="ocpiDetailTableDataSource"></app-table>'
})

export class OcpiDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: any;

  constructor(public ocpiDetailTableDataSource: OcpiDetailTableDataSource) {
    super();
  }

  ngOnInit(): void {
    // Set
    this.ocpiDetailTableDataSource.setEndpoint(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set
    this.ocpiDetailTableDataSource.setEndpoint(this.row);
    // Reload data
    this.ocpiDetailTableDataSource.refreshData(false).subscribe();
  }
}
