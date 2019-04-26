import { Component, Input } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="row justify-content-center">
        <ng-container *ngFor="let connector of row.connectors">
          <app-connector-id-cell [row]="connector" [largeDisplay]="false"></app-connector-id-cell>
        </ng-container>
    </div>
  `
})
export class ConnectorsCellComponent extends CellContentTemplateComponent {
  @Input() row: Charger;
}
