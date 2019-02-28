import {Component, Injectable, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';
import { AuthorizationService } from 'app/services/authorization-service';

@Component({
  selector: 'app-connector-id-cell',
  styleUrls: ['./connector-cell.scss'],
  template: `
    <div class="row m-0 p-0" [class.simple-connector]="isSimpleConnectorDisplay" [class.detail-connector]="!isSimpleConnectorDisplay">
    <div class="charger-connector-container">
      <div class="charger-connector-background" [appChargerStatus]="{status: chargerStatus, target: 'background'}">
      </div>
      <div [matTooltip]="row.status"
          class="charger-connector-text" [appChargerStatus]="{status: chargerStatus, target: 'text'}">
        {{row.connectorId | appConnectorId}}
      </div>
    </div>
    <div *ngIf="!isSimpleConnectorDisplay" [matTooltip]="row.type | appConnectorType:false | translate"
      class="charger-connector-container charger-connector-container-image
              d-flex align-items-center justify-content-center"
              [class.charger-connector-container-image-small]="!largeDisplay"
              [appChargerStatus]="{status: chargerStatus, target: 'background-image'}">
          <img width="22" height="22" src="{{row.type | appConnectorType}}">
    </div>
  </div>
  `
})

@Injectable()
export class ConnectorCellComponent extends CellContentTemplateComponent implements OnInit {

  @Input() row: any;
  @Input() largeDisplay = true;

  chargerStatus: string;
  isSimpleConnectorDisplay: boolean;
  chargerActive = false;
  minWidth = 'min-width:30px';

  constructor(private _authorizationService: AuthorizationService) {
    super();
  }

  ngOnInit(): void {
    this.updateValues();
    this.isSimpleConnectorDisplay = false;
    this.minWidth = (this.isSimpleConnectorDisplay ? 'min-width:30px' : 'min-width:50px');
  }

  refresh() {
    this.updateValues();
  }

  updateValues() {
    this.chargerStatus = this.row.status;
    this.chargerActive = false;
    if (this.row.status === 'Charging' || this.row.status === 'Occupied') {
      this.chargerActive = this.row.currentConsumption > 0;
      this.chargerStatus = (this.row.currentConsumption > 0 ? `${this.row.status}-active` : `${this.row.status}-inactive`);
    }
  }
}
