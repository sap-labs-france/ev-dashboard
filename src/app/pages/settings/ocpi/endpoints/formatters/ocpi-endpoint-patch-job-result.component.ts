import {Ocpiendpoint} from '../../../../../common.types';
import {ChipComponent, TYPE_DANGER, TYPE_DEFAULT, TYPE_SUCCESS, TYPE_WARNING} from '../../../../../shared/component/chip/chip.component';
import {Component, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-log-level-chip',
  templateUrl: '../../../../../shared/component/chip/chip.component.html'
})
export class OcpiendpointPatchJobResultComponent extends ChipComponent {
  @Input() row: Ocpiendpoint;

  constructor(
    private translateService: TranslateService) {
    super();
  }

  loadContent(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.type = 'chip-width-10em ';
    this.text = '0 / 0';

    if (this.row.lastPatchJobResult) {
      const totalEVSEs = this.row.lastPatchJobResult.successNbr + this.row.lastPatchJobResult.failureNbr;
      this.text = `${this.row.lastPatchJobResult.successNbr} / ${totalEVSEs}`
      if (this.row.lastPatchJobResult.successNbr === 0 && this.row.lastPatchJobResult.failureNbr > 0) {
        this.type += TYPE_DANGER;
        this.text = this.translateService.instant('general.error');
      } else if (this.row.lastPatchJobResult.successNbr > 0 && this.row.lastPatchJobResult.failureNbr === 0) {
        this.type += TYPE_SUCCESS;
        this.text = this.translateService.instant('general.success');
      } else if (this.row.lastPatchJobResult.successNbr > 0 && this.row.lastPatchJobResult.failureNbr > 0) {
        this.type += TYPE_WARNING;
        this.text = this.translateService.instant('general.warning');
      } else {
        this.type += TYPE_SUCCESS;
        this.text = this.translateService.instant('general.success');
      }
    } else {
      this.type += TYPE_DEFAULT;
      this.text = this.translateService.instant('ocpiendpoints.background_job_no_run');
    }
  }
}
