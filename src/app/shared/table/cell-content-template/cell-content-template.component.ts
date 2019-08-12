import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableColumnDef } from '../../../common.types';


export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;

  ngOnChanges(changes: SimpleChanges): void {
  }
}
