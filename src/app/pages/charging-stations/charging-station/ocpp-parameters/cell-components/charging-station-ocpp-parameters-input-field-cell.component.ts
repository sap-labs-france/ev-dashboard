import { Component, Injectable, Input, OnInit } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { OcppParameter } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-ocpp-parameters-input-field-cell',
  template: `
    <ng-container *ngIf="row.id !== idValue">
      <span class="text-right" >{{row.key}}</span>
    </ng-container>
    <ng-container *ngIf="row.id === idValue">
    <input [id]="tableColumnDefId" [name]="tableColumnDefId" class="form-control text-line table-cell-angular-input-component"
      [placeholder]="tableColumnDefName | translate"
      [ngModel]="row[tableColumnDefId]" (ngModelChange)= "valueChanged($event)"
      type="text">
    </ng-container>
  `,
})
@Injectable()
export class ChargingStationOcppParametersInputFieldCellComponent extends CellContentTemplateComponent implements OnInit{
  @Input() row!: OcppParameter;
  public idValue!: string | number;
  public tableColumnDefId!: string;
  public tableColumnDefName!: string;

  ngOnInit() {
    this.idValue = 'InputRow';
    this.tableColumnDefId = 'key';
    this.tableColumnDefName = 'chargers.charger_param_key';
  }

  public valueChanged(value: string) {
    this.row.key = value;
    this.componentChanged.emit(value);
  }


}
