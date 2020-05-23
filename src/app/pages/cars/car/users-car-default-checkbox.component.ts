import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UserCar } from 'app/types/Car';
import { UserToken } from 'app/types/User';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';


@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto"
        [checked]="row.default" (change)="setDefault($event)"></mat-checkbox>
    </div>`,
})
export class UsersCarDefaultCheckboxComponent extends CellContentTemplateDirective {
  @Input() public row!: UserCar;
  public loggedUser: UserToken;

  constructor(
  ) {
    super();
  }

  public setDefault(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.row.default = matCheckboxChange.checked;
    }
  }
}
