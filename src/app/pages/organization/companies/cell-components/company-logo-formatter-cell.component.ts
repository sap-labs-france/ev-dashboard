import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { Company } from '../../../../types/Company';

@Component({
  template: `
    <div class="logo-container">
      <img
        class="app-company-logo"
        alt=""
        crossorigin="anonymous"
        [src]="row['logo']"
        onerror="this.src='/assets/img/theme/no-image.png';"
      />
    </div>
  `,
  styleUrls: ['company-logo-formatter-cell.component.scss'],
})
export class CompanyLogoFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Company;
}
