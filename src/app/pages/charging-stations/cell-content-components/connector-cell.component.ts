import { Component, Input, AfterViewInit, OnInit, AfterContentInit } from '@angular/core';
import { TableColumnDef, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  selector: 'connector-id-cell',
  template: `
      <div class="charger-connector charger-connector-background {{getClassForStatus(connector.status)}}">
        <span [class]="getTextClassForStatus(connector.status)">
          {{connector.connectorId | appConnectorId}}
        </span>
      </div>
  `
})


export class ConnectorCellComponent implements CellContentTemplateComponent {

  @Input() connectorInput?: Connector;
  @Input() connectorId?: number;
  @Input() connectorStatus?: string;
  connector: Connector;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.connectorInput) {
        this.connector = this.connectorInput;
    } else if (this.connectorId && this.connectorStatus) {
      this.connector.connectorId = this.connectorId;
      this.connector.status = this.connectorStatus;
    }
  }
  /**
   * setData
   */
   setData(connector: any, columndef: TableColumnDef) {
     try { 
        if (connector.errorCode && connector.power) {
          // Assume we have a real Connector
          this.connector = <Connector>connector;
        } else {
          // Just copy the minimum information
          this.connector = <Connector>{};
          this.connector.connectorId = connector.connectorId;
          this.connector.status = connector.status;
        }
      } catch (error) {
        // Invalid input
        this.connector.connectorId = 0;
        this.connector.status = 'Invalid Input';
      }
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
