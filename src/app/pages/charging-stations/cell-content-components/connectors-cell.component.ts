import { Component, Input } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  template: `
    <table>
      <tr>
        <ng-container *ngFor="let connector of row.connectors">
        <td class="charger-connector">
          <app-connector-id-cell [row]="connector" [largeDisplay]="false"></app-connector-id-cell>
        </td>
        </ng-container>
      </tr>
    </table>
  `
})


export class ConnectorsCellComponent extends CellContentTemplateComponent {

  @Input() row: Charger;

}
