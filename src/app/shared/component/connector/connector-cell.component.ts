import {Component, Injectable, Input} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';

@Component({
  selector: 'app-connector-id-cell',
  styleUrls: ['./connector-cell.scss'],
  template: `
    <div data-toggle="tooltip" [attr.title]="row.status"
         class="charger-connector charger-connector-background" [appChargerStatus]="row.status">
        <span [appChargerStatusText]="row.status">
          {{row.connectorId | appConnectorId}}
        </span>
    </div>
  `
})

@Injectable()
export class ConnectorCellComponent extends CellContentTemplateComponent {

  @Input() row: any;

}
