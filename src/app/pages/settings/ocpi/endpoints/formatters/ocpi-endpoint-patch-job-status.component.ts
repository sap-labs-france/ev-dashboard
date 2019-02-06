import {Ocpiendpoint} from '../../../../../common.types';
import {ChipComponent, TYPE_DEFAULT, TYPE_SUCCESS} from '../../../../../shared/component/chip/chip.component';
import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointPatchJobStatusComponent extends ChipComponent implements OnInit {

  @Input() row: Ocpiendpoint;

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-10em ';
    if (this.row.backgroundPatchJob) {
      this.text = 'ocpiendpoints.status_active';
      this.type += TYPE_SUCCESS;
    } else {
      this.text = 'ocpiendpoints.status_inactive';
      this.type += TYPE_DEFAULT;
    }
  }
}
