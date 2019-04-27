import {KeyValue, OcpiEndpoint} from '../../../../../common.types';
import {Constants} from '../../../../../utils/Constants';
import {ChipComponent, TYPE_GREY, TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-log-level-chip',
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiEndpointStatusComponent extends ChipComponent {

  @Input() row: OcpiEndpoint;

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    for (const ocpiStatus of ocpiStatuses) {
      if (ocpiStatus.key === this.row.status) {
        this.text = ocpiStatus.value
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
      case Constants.OCPIENDPOINT_STATUS_UNREGISTERED:
        this.type += TYPE_WARNING;
        break;
      default:
        this.type += TYPE_GREY;
    }
  }
}

export const ocpiStatuses: KeyValue[] = [
  {key: 'new', value: 'ocpiendpoints.new'},
  {key: 'registered', value: 'ocpiendpoints.registered'},
  {key: 'unregistered', value: 'ocpiendpoints.unregistered'}
];
