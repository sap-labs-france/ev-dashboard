import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableColumnDef } from 'app/types/Table';

export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;
  @Input() columnDef!: TableColumnDef;

  // tslint:disable-next-line:no-empty
  ngOnChanges(changes: SimpleChanges): void {}
}
