import { Component, Input, OnInit } from '@angular/core';
import { Connector } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipComponent, TYPE_DANGER, TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING, TYPE_GREY } from 'app/shared/component/chip/chip.component';

@Component({
  selector: 'app-connector-availability',
  styleUrls: ['../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../shared/component/chip/chip.component.html'
})
export class ConnectorAvailibilityComponent extends ChipComponent implements CellContentTemplateComponent, OnInit {
  @Input() row: Connector;

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
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
