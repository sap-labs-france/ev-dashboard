import { Input, OnChanges, SimpleChanges } from '@angular/core';

export abstract class CellContentTemplateComponent implements OnChanges {
  @Input() row: any;

  ngOnChanges(changes: SimpleChanges): void {
  }
}
