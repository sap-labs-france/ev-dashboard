import { Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Data, TableColumnDef } from 'app/types/Table';

@Directive()
export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() public row: any;
  @Input() public columnDef!: TableColumnDef;
  @Output() public componentChanged = new EventEmitter<any>();

  // tslint:disable-next-line:no-empty
  public ngOnChanges(changes: SimpleChanges): void {}
}
