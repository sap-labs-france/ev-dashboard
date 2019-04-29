import {Input, SimpleChanges, OnChanges} from '@angular/core';

export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;

  ngOnChanges(changes: SimpleChanges): void {
  }
}
