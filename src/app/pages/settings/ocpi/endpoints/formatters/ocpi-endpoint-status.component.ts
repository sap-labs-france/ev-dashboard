import {TableColumnDef, Ocpiendpoint, KeyValue} from '../../../../../common.types';
import {CellContentTemplateComponent} from '../../../../../shared/table/cell-content-template/cell-content-template.component';
import {Constants} from '../../../../../utils/Constants';
import {
  ChipComponent} from '../../../../../shared/component/chip/chip.component';
import {TYPE_DANGER, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_WARNING, TYPE_INFO
} from '../../../../../shared/component/chip/chip.component';
import {Component, Input, OnInit} from '@angular/core';



@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointStatusComponent extends ChipComponent implements CellContentTemplateComponent, OnInit {

  @Input() row: Ocpiendpoint;

   ngOnInit(): void {
     // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
     // Add 'implements OnInit' to the class.
    for (const userStatus of userStatuses) {
      if (userStatus.key === this.row.status) {
        this.text = userStatus.value
      }
    }
    this.type = 'chip-width-10em ';
    switch (this.row.status) {
      case Constants.OCPIENDPOINT_STATUS_NEW:
        this.type += TYPE_INFO;
        break;
      case Constants.OCPIENDPOINT_STATUS_REGISTERED:
        this.type += TYPE_SUCCESS;
        break;
      default:
        this.type += TYPE_DEFAULT;
    }
  }
}


export const userStatuses: KeyValue[] = [
  {key: 'new', value: 'ocpiendpoints.new'},
  {key: 'registered', value: 'ocpiendpoints.registered'}
];
