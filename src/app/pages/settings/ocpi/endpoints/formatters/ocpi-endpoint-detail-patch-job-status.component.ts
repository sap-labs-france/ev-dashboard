import {OcpiendpointDetail} from 'app/common.types';
import {ChipComponent, TYPE_GREY, TYPE_SUCCESS} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-log-level-chip',
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointDetailPatchJobStatusComponent extends ChipComponent {

  @Input() row: OcpiendpointDetail;

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-10em ';
    if (this.row.ocpiendpoint.backgroundPatchJob) {
      this.text = 'ocpiendpoints.status_active';
      this.type += TYPE_SUCCESS;
    } else {
      this.text = 'ocpiendpoints.status_inactive';
      this.type += TYPE_GREY;
    }
  }
}
