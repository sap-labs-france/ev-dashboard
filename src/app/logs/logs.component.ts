import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataSource } from '@angular/cdk/table';
import 'rxjs/add/operator/mergeMap';
import { LocaleService } from '../service/locale.service';
import { CentralServerService } from '../service/central-server.service';
import { SpinnerService } from '../service/spinner.service';
import { AuthorizationService } from '../service/authorization-service';
import { MessageService } from '../service/message.service';
import { TableDataSource } from '../shared/table/table-data-source';
import { TableColumnDef } from '../model/table-column-def';
import { Log } from '../model/log';

@Component({
    selector: 'app-logs-cmp',
    templateUrl: 'logs.component.html'
})
export class LogsComponent implements OnInit {
    // @ViewChild('logTable') siteTable: TableComponent;
    private messages;
    public isAdmin;

    constructor(
            private authorizationService: AuthorizationService,
            private centralServerService: CentralServerService,
            private messageService: MessageService,
            private spinnerService: SpinnerService,
            private translateService: TranslateService,
            private localeService: LocaleService,
            private activatedRoute: ActivatedRoute,
            private router: Router) {
        // Get translated messages
        this.translateService.get('logs', {}).subscribe((messages) => {
            this.messages = messages;
        });
        // Admin?
        this.isAdmin = this.authorizationService.isAdmin();
        // // Create table data source
        // this.siteDataSource = new SiteDataSource(
        //     this.messageService,
        //     this.translateService,
        //     this.router,
        //     this.centralServerService);
    }

    ngOnInit() {
        // Load Logs
        this.loadLogs();
        // Scroll up
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
    }

    refresh() {
        this.loadLogs();
    }

    loadLogs() {
        // // Show spinner
        // this.spinnerService.show();
        // // Yes, get it
        // this.centralServerService.getUser(this.activatedRoute.snapshot.params['id']).flatMap((user) => {
        //     // Set user
        //     this.siteDataSource.setUser(user);
        //     // Init form
        //     if (user.id) {
        //         this.formGroup.controls.id.setValue(user.id);
        //     }
        //     if (user.name) {
        //         this.formGroup.controls.name.setValue(user.name);
        //     }
        //     if (user.firstName) {
        //         this.formGroup.controls.firstName.setValue(user.firstName);
        //     }
        //     if (user.email) {
        //         this.formGroup.controls.email.setValue(user.email);
        //         this.originalEmail = user.email;
        //     }
        //     if (user.phone) {
        //         this.formGroup.controls.phone.setValue(user.phone);
        //     }
        //     if (user.mobile) {
        //         this.formGroup.controls.mobile.setValue(user.mobile);
        //     }
        //     if (user.iNumber) {
        //         this.formGroup.controls.iNumber.setValue(user.iNumber);
        //     }
        //     if (user.costCenter) {
        //         this.formGroup.controls.costCenter.setValue(user.costCenter);
        //     }
        //     if (user.status) {
        //         this.formGroup.controls.status.setValue(user.status);
        //     }
        //     if (user.role) {
        //         this.formGroup.controls.role.setValue(user.role);
        //     }
        //     if (user.locale) {
        //         this.formGroup.controls.locale.setValue(user.locale);
        //     }
        //     if (user.tagIDs) {
        //         this.formGroup.controls.tagIDs.setValue(user.tagIDs);
        //     }
        //     if (user.address && user.address.address1) {
        //         this.address.controls.address1.setValue(user.address.address1);
        //     }
        //     if (user.address && user.address.address2) {
        //         this.address.controls.address2.setValue(user.address.address2);
        //     }
        //     if (user.address && user.address.postalCode) {
        //         this.address.controls.postalCode.setValue(user.address.postalCode);
        //     }
        //     if (user.address && user.address.city) {
        //         this.address.controls.city.setValue(user.address.city);
        //     }
        //     if (user.address && user.address.department) {
        //         this.address.controls.department.setValue(user.address.department);
        //     }
        //     if (user.address && user.address.region) {
        //         this.address.controls.region.setValue(user.address.region);
        //     }
        //     if (user.address && user.address.country) {
        //         this.address.controls.country.setValue(user.address.country);
        //     }
        //     if (user.address && user.address.latitude) {
        //         this.address.controls.latitude.setValue(user.address.latitude);
        //     }
        //     if (user.address && user.address.longitude) {
        //         this.address.controls.longitude.setValue(user.address.longitude);
        //     }
        //     // Reset password
        //     this.passwords.controls.password.setValue('');
        //     this.passwords.controls.repeatPassword.setValue('');
        //     // Yes, get image
        //     return this.centralServerService.getUserImage(this.activatedRoute.snapshot.params['id']);
        // }).subscribe((userImage) => {
        //     if (userImage && userImage.image) {
        //         this.image = userImage.image.toString();
        //     }
        //     // Hide
        //     this.spinnerService.hide();
        // }, (error) => {
        //     // Hide
        //     this.spinnerService.hide();
        //     // Handle error
        //     switch (error.status) {
        //         // Server not responding
        //         case 0:
        //             // Report the error
        //             this.messageService.showErrorMessage(this.translateService.instant('general.backend_not_running'));
        //             break;

        //         // Not found
        //         case 550:
        //             // Transaction not found`
        //             Utils.handleHttpError(error, this.router, this.messageService,
        //                 this.messages['user_not_found']);
        //             break;
        //         default:
        //             // Unexpected error`
        //             Utils.handleHttpError(error, this.router, this.messageService,
        //                 this.translateService.instant('general.unexpected_error_backend'));
        //     }
        // });
    }

}

class LogDataSource extends TableDataSource<Log> implements DataSource<Log> {
    private numberOfRecords = 0;

    constructor(
            private messageService: MessageService,
            private translateService: TranslateService,
            private router: Router,
            private centralServerService: CentralServerService) {
        super();
    }

    loadData() {
        // Update page length (number of sites is in User)
        this.updatePaginator();
        // // Yes: Get data
        // this.centralServerService.getSites(this.getSearch(),
        //         this.getPaging(), this.getOrdering()).subscribe((sites) =>  {
        //     // Return sites
        //     this.getSubjet().next(sites);
        // }, (error) => {
        //     // No longer exists!
        //     Utils.handleHttpError(error, this.router, this.messageService, this.translateService.instant('sites.update_error'));
        // });
    }

    getColumnDefs(): TableColumnDef[] {
        // As sort directive in table can only be unset in Angular 7, all columns will be sortable
        return [
            { id: 'name', name: this.translateService.instant('sites.name'), class: 'text-left', sorted: true, direction: 'asc' },
            { id: 'address.city', name: this.translateService.instant('general.city'), class: 'text-left' },
            { id: 'address.country', name: this.translateService.instant('general.country'), class: 'text-left' }
        ];
    }

    getNumberOfRecords(): number {
        return this.numberOfRecords;
    }
}

