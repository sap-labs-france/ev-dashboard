import {OcpiendpointDetail} from 'app/common.types';
import {ChipComponent, TYPE_DEFAULT, TYPE_DANGER} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointDetailFailureEvsesStatusComponent extends ChipComponent {

  @Input() row: OcpiendpointDetail;

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-10em ';
    this.text = this.row.failureNbr.toString();
    if (this.row.failureNbr > 0) {
      this.type += TYPE_DANGER;
    } else {
      this.type += TYPE_DEFAULT;
    }
  }
}
