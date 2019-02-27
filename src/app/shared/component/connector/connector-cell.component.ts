import {Component, Injectable, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';

@Component({
  selector: 'app-connector-id-cell',
  styleUrls: ['./connector-cell.scss'],
  template: `
    <div data-toggle="tooltip" [attr.title]="row.status"
        class="charger-connector-container" [appChargerStatus]="chargerStatus">
      <span class="charger-connector-charging-active-text">
        {{row.connectorId | appConnectorId}}
      </span>
    </div>
  `
})

@Injectable()
export class ConnectorCellComponent extends CellContentTemplateComponent implements OnInit {

  @Input() row: any;

  chargerStatus: string;

  ngOnInit(): void {
    this.updateValues();
  }

  refresh() {
    this.updateValues();
  }

  updateValues() {
    this.chargerStatus = this.row.status;
    if (this.row.status === 'Charging' || this.row.status === 'Occupied') {
      this.chargerStatus = (this.row.currentConsumption > 0 ? `${this.row.status}-active` : `${this.row.status}-inactive`);
    }
  }
}
