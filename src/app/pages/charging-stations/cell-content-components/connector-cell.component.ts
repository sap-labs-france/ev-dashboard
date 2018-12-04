import { Component, Input, AfterViewInit, OnInit, AfterContentInit, Injectable } from '@angular/core';
import { TableColumnDef, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  selector: 'connector-id-cell',
  template: `
      <div class="charger-connector charger-connector-background {{getClassForStatus(row.status)}}">
        <span [class]="getTextClassForStatus(row.status)">
          {{row.connectorId | appConnectorId}}
        </span>
      </div>
  `
})

@Injectable()
export class ConnectorCellComponent implements CellContentTemplateComponent, OnInit {

  @Input() row: any;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
//    this.tooltip = this.translateService.instant('connector_status_tooltip');
  }
  
  getClassForStatus(status: string) {
    switch (status) {
      case "Available": {
        return "charger-connector-available";
      }
      case "Preparing": {
        return "charger-connector-preparing";
      }
      case "SuspendedEVSE": {
        return "charger-connector-suspended-evse";
      }
      case "SuspendedEV": {
        return "charger-connector-suspended-ev";
      }
      case "Finishing": {
        return "charger-connector-finishing";
      }
      case "Reserved": {
        return "charger-connector-reserved";
      }
      case "Charging":
      case "Occupied": {
        return "charger-connector-charging";
      }
      case "Unavailable": {
        return "charger-connector-unavailable";
      }
      case "Faulted": {
        return "charger-connector-faulted";
      }
      default: {
        return "'charger-connector-active-text'";
      }
    }
  }

  getTextClassForStatus(status: String) {
    switch (status) {
      case "Reserved":
      case "Available": {
        return "charger-connector-text";
      }
      case "Finishing":
      case "Preparing":
      case "SuspendedEVSE":
      case "SuspendedEV":
      case "Charging":
      case "Occupied":
      case "Unavailable":
      case "Faulted":
      default: {
        return "charger-connector-active-text";
      }
    }
  }
}
