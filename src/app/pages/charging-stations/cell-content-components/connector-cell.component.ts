import { Component, Input, Injectable } from '@angular/core';
import { TableColumnDef, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  selector: 'connector-id-cell',
  template: `
      <div data-toggle="tooltip" [attr.title]="row.status" class="charger-connector charger-connector-background" [appChargerStatus]="row.status">
        <span [appChargerStatusText]="row.status">
          {{row.connectorId | appConnectorId}}
        </span>
      </div>
  `
})

@Injectable()
export class ConnectorCellComponent implements CellContentTemplateComponent {

  @Input() row: any;
  
}
