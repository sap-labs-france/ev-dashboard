import { Component, Input } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
  <table><tr>
    <ng-container *ngFor="let connector of row.connectors">
    <td class="charger-connector">
      <connector-id-cell [row]="connector"></connector-id-cell>
    </td>
    </ng-container>
  </tr>
</table>
  `
})


export class ConnectorsCellComponent implements CellContentTemplateComponent {

  @Input() row: Charger;

}
