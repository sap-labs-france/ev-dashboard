import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ChangeEvent, UserCar } from 'app/types/Car';
import { UserToken } from 'app/types/User';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto"
        [checked]="row.default" (change)="setDefault($event)"></mat-checkbox>
    </div>`,
})
export class UsersCarDefaultCheckboxComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: UserCar;
  @Input() public changed!: ChangeEvent;
  public loggedUser: UserToken;

  constructor(
  ) {
    super();
  }


  public ngOnInit() {
    this.changed = this.columnDef.additionalParameters.changed as ChangeEvent;
  }


  public setDefault(matCheckboxChange: MatCheckboxChange) {
    this.changed.changed = true;
    if (matCheckboxChange) {
      this.row.default = matCheckboxChange.checked;
    }
  }
}
