import { EventEmitter, Input, OnChanges, Output, SimpleChanges, Directive } from '@angular/core';
import { Data, TableColumnDef } from 'app/types/Table';

@Directive()
export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;
  @Input() columnDef!: TableColumnDef;
  @Output() componentChanged = new EventEmitter<any>();

  // tslint:disable-next-line:no-empty
  ngOnChanges(changes: SimpleChanges): void {}
}
