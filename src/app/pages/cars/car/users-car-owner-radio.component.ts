import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import { ChangeEvent, UserCar } from 'app/types/Car';
import { UserToken } from 'app/types/User';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
      <div class="d-flex justify-content-center">
          <mat-radio-button #rbid class="mx-auto"
                            [checked]="(row.owner ? true : false)"
                            (change) = "changeRadioButton($event)"
                            ></mat-radio-button>
      </div>`,
})
export class UsersCarOwnerRadioComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: UserCar;
  @Input() public usersCar!: UserCar[];
  @Input() public changed!: ChangeEvent;
  @ViewChild('rbid') public radioButtonRef!: MatRadioButton;
  public loggedUser: UserToken;

  constructor(
  ) {
    super();
  }

  public ngOnInit() {
    this.usersCar = this.columnDef.additionalParameters.usersCar as UserCar[];
    this.changed = this.columnDef.additionalParameters.changed as ChangeEvent;
  }


  public changeRadioButton(matRadioChange: MatRadioChange) {
    matRadioChange.source.checked = !matRadioChange.source.checked;
    this.radioButtonRef.checked = !this.radioButtonRef.checked;
    this.changed.changed = true;
    this.usersCar.forEach(userCar => {
      userCar.owner = false;
    });
    this.row.owner = true;
  }
}
