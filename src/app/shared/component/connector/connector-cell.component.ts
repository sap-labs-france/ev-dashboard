import {Component, Injectable, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';
import {AuthorizationService} from 'app/services/authorization-service';
import { AppConnectorTypePipe } from 'app/shared/formatters/app-connector-type.pipe';

@Component({
  selector: 'app-connector-id-cell',
  templateUrl: './connector-cell.component.html'
})

@Injectable()
export class ConnectorCellComponent extends CellContentTemplateComponent implements OnInit {

  @Input() row: any;
  @Input() largeDisplay = true;

  chargerStatus: string;
  isSimpleConnectorDisplay: boolean;
  chargerActive = false;
  baseClassConnectorTypeText: string;
  isAdmin = false;
  typeSvgIcon: string;
  typeTooltip: string;
  tooltipTypeOffest: any;

  constructor(private _authorizationService: AuthorizationService,
    private _appConnectorTypePipe: AppConnectorTypePipe) {
    super();
    this.isAdmin = this._authorizationService.isAdmin();
  }

  ngOnInit(): void {
    this.isSimpleConnectorDisplay = false;
    this.baseClassConnectorTypeText =
      `charger-connector-container charger-connector-container-image d-flex align-items-center justify-content-center ${(this.largeDisplay ? 
        'charger-connector-container-image-large' : 'charger-connector-container-image-small')} ${(this.isAdmin && this.row.type === null) ? 'connector-not-typed-icon' : ''}`;
    this.tooltipTypeOffest = (this.largeDisplay ? '0px, 8px' : '-15px, 8px');
    this.updateValues();
  }

  refresh() {
    this.updateValues();
  }

  updateValues() {
    if (!this.row.type || (this.row.type === null)){
      this.row.type = 'U';
    };  
    this.typeSvgIcon = this._appConnectorTypePipe.transform(this.row.type, true);
    this.typeTooltip = this._appConnectorTypePipe.transform(this.row.type, false);
    
    if (this.row.status === 'Charging' || this.row.status === 'Occupied') {
      this.chargerActive = this.row.currentConsumption > 0;
      this.chargerStatus = (this.row.currentConsumption > 0 ? `${this.row.status}-active` : `${this.row.status}-inactive`);
    } else {
      this.chargerActive = false;
      this.chargerStatus = this.row.status;
    }
  }
}
