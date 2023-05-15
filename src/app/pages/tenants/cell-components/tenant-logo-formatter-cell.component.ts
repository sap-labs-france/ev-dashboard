import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Tenant } from '../../../types/Tenant';

@Component({
  template: `
    <div class="logo-container">
      <img
        class="app-tenants-logo"
        crossorigin="anonymous"
        [src]="row['logo']"
        alt=""
        onerror="this.src='/assets/img/theme/no-image.png';"
      />
    </div>
  `,
  styleUrls: ['tenant-logo-formatter-cell.component.scss'],
})
export class TenantLogoFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Tenant;
}
