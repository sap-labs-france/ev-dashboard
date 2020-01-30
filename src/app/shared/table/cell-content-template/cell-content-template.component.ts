import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Data, TableColumnDef } from 'app/types/Table';

export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;
  @Input() columnDef!: TableColumnDef;
  @Output() componentChanged = new EventEmitter<any>();

  // tslint:disable-next-line:no-empty
  ngOnChanges(changes: SimpleChanges): void {}
}
