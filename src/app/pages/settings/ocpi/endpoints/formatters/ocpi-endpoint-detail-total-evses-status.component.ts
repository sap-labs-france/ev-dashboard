import {OcpiendpointDetail} from 'app/common.types';
import {ChipComponent, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_INFO} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointDetailTotalEvsesStatusComponent extends ChipComponent {

  @Input() row: OcpiendpointDetail;

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-8em ';
    this.text = this.row.totalNbr.toString();
    if (this.row.totalNbr > 0) {
      this.type += TYPE_INFO;
    } else {
      this.type += TYPE_DEFAULT;
    }
  }
}
