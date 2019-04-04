import {Component, Input} from '@angular/core';
import {Connector} from 'app/common.types';
import {ChipComponent, TYPE_DANGER, TYPE_GREY, TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING} from 'app/shared/component/chip/chip.component';

@Component({
  selector: 'app-connector-availability',
  templateUrl: '../../../shared/component/chip/chip.component.html'
})
export class ConnectorAvailibilityComponent extends ChipComponent {
  @Input() row: Connector;

  loadContent() {
    this.text = this.row.status;
    this.type = 'chip-width-8em ';
    switch (this.row.status) {
      case 'Available': {
        this.type += TYPE_SUCCESS;
        break;
      }
      case 'Preparing': {
        this.type += TYPE_WARNING;
        break;
      }
      case 'SuspendedEVSE': {
        this.type += TYPE_INFO;
        break;
      }
      case 'SuspendedEV': {
        this.type += TYPE_INFO;
        break;
      }
      case 'Finishing': {
        this.type += TYPE_WARNING;
        break;
      }
      case 'Reserved': {
        this.type += TYPE_INFO;
        break;
      }
      case 'Charging':
      case 'Occupied': {
        this.type += TYPE_INFO;
        break;
      }
      case 'Unavailable': {
        this.type += TYPE_GREY;
        break;
      }
      case 'Faulted': {
        this.type += TYPE_DANGER;
        break;
      }
      default: {
        this.type += TYPE_WARNING;
        break;
      }
    }
  }
}
