import { Component } from '@angular/core';
import { TableColumnDef, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import {ChipComponent, TYPE_DANGER, TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING} from '../../../shared/component/chip/chip.component';

export class ConnectorAvailibilityComponent extends ChipComponent implements CellContentTemplateComponent {
  /**
   * setData
   */
  setData(connector: Connector, columndef: TableColumnDef) {
    this.text = connector.status;
    switch (connector.status) {
      case 'Available': {
        this.type = TYPE_SUCCESS + " chip-width-8em";
        break;
      }
      case 'Preparing': {
        this.type = TYPE_WARNING + " chip-width-8em";
        break;
      }
      case 'SuspendedEVSE': {
        this.type = TYPE_INFO + " chip-width-8em"; //'charger-connector-suspended-evse';
        break;
      }
      case 'SuspendedEV': {
        this.type = TYPE_INFO + " chip-width-8em";
        break;
      }
      case 'Finishing': {
        this.type = TYPE_WARNING + " chip-width-8em";
        break;
      }
      case 'Reserved': {
        this.type = TYPE_INFO + " chip-width-8em";
        break;
      }
      case 'Charging':
      case 'Occupied': {
        this.type = TYPE_INFO + " chip-width-8em";
        break;
      }
      case 'Unavailable': {
        this.type = TYPE_DANGER + " chip-width-8em";
        break;
      }
      case 'Faulted': {
        this.type = TYPE_DANGER + " chip-width-8em";
        break;
      }
      default: {
        this.type = TYPE_WARNING + " chip-width-8em";
        break;
      }
    }
  }
}
