import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ChargersDataSource} from './chargers-data-source-table';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {Charger, KeyValue} from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html',
  styleUrls: ['../dialogs.component.scss'],
})
export class ChargersDialogComponent extends DialogTableDataComponent<Charger> {
  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<ChargersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data);

    // Create table data source
    this.dialogDataSource = new ChargersDataSource(
      this.messageService,
      this.translateService,
      this.router,
      this.centralServerService);
  }

  getSelectedItems(selectedRows: Charger[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.id, objectRef: row});
      });
    }
    return items;
  }
}
