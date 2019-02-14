import {Ocpiendpoint} from '../../../../../common.types';
import {ChipComponent, TYPE_DANGER, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_WARNING} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointPatchJobResultComponent extends ChipComponent {

  @Input() row: Ocpiendpoint;

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-10em ';
    this.text = '0 / 0';

    if (this.row.lastPatchJobResult) {
      this.text = `${this.row.lastPatchJobResult.successNbr} / ${this.row.lastPatchJobResult.failureNbr}`
      if (this.row.lastPatchJobResult.successNbr === 0 && this.row.lastPatchJobResult.failureNbr > 0) {
        this.type += TYPE_DANGER;
      } else if (this.row.lastPatchJobResult.successNbr > 0 && this.row.lastPatchJobResult.failureNbr === 0) {
        this.type += TYPE_SUCCESS;
      } else if (this.row.lastPatchJobResult.successNbr > 0 && this.row.lastPatchJobResult.failureNbr > 0) {
        this.type += TYPE_WARNING;
      } else {
        this.type += TYPE_DEFAULT;
      }
    } else {
      this.type += TYPE_DEFAULT;
    }
  }
}
