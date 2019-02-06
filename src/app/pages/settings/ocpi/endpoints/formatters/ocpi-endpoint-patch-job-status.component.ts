import { TableColumnDef, Ocpiendpoint, KeyValue } from '../../../../../common.types';
import { CellContentTemplateComponent } from '../../../../../shared/table/cell-content-template/cell-content-template.component';
import { Constants } from '../../../../../utils/Constants';
import { ChipComponent } from '../../../../../shared/component/chip/chip.component';
import { TYPE_DANGER, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_WARNING, TYPE_INFO } from '../../../../../shared/component/chip/chip.component';
import { Component, Input, OnInit } from '@angular/core';



@Component({
  selector: 'app-log-level-chip',
  styleUrls: ['../../../../../shared/component/chip/chip.component.scss'],
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointPatchJobStatusComponent extends ChipComponent implements CellContentTemplateComponent, OnInit {

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
