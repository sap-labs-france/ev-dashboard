import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataSource } from '@angular/cdk/table';
import 'rxjs/add/operator/mergeMap';
import { LocaleService } from '../../service/locale.service';
import { CentralServerService } from '../../service/central-server.service';
import { SpinnerService } from '../../service/spinner.service';
import { AuthorizationService } from '../../service/authorization-service';
import { MessageService } from '../../service/message.service';
import { TableDataSource } from '../../shared/table/table-data-source';
import { TableColumnDef } from '../../model/table-column-def';
import { Log } from '../../model/log';
import { Utils } from '../../utils/Utils';
import { Formatters } from '../../utils/Formatters';

@Component({
    selector: 'app-logs-cmp',
    templateUrl: 'logs.component.html'
})
export class LogsComponent implements OnInit {
    private messages;
    public isAdmin;
    public logDataSource: LogDataSource;

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
        // Create table data source
        this.logDataSource = new LogDataSource(
            this.localeService,
            this.messageService,
            this.translateService,
            this.router,
            this.centralServerService);
    }

    ngOnInit() {
        // Scroll up
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 500 });
    }
}

class LogDataSource extends TableDataSource<Log> implements DataSource<Log> {
    private numberOfRecords = 0;

    constructor(
            private localeService: LocaleService,
            private messageService: MessageService,
            private translateService: TranslateService,
            private router: Router,
            private centralServerService: CentralServerService) {
        super();
    }

    loadData() {
        this.numberOfRecords = 1000;
        // Update page length
        // this.updatePaginator();
        // Get data
        this.centralServerService.getLogs(this.getSearch(),
                this.getPaging(), this.getOrdering()).subscribe((logs) =>  {
            // Add the users in the message
            logs.map((log) => {
                let user;
                // Set User
                if (log.user) {
                    user = log.user;
                }
                // Set Action On User
                if (log.actionOnUser) {
                    user = (user ? `${user} > ${log.actionOnUser}` : log.actionOnUser);
                }
                // Set
                if (user) {
                    log.message = `${user} > ${log.message}`;
                }
                return log;
            });
            // Return logs
            this.getSubjet().next(logs);
        }, (error) => {
            // No longer exists!
            Utils.handleHttpError(error, this.router, this.messageService, this.translateService.instant('general.error_backend'));
        });
    }

    getColumnDefs(): TableColumnDef[] {
        // As sort directive in table can only be unset in Angular 7, all columns will be sortable
        return [
            {
                id: 'level',
                name: this.translateService.instant('logs.status'),
                formatter: Formatters.formatLogLevel,
                formatterOptions: { iconClass: 'ml-2' },
                class: 'text-center logs-col-status'
            },
            {
                id: 'timestamp',
                type: 'date',
                formatter: Formatters.createDateTimeFormatter(this.localeService).format,
                name: this.translateService.instant('logs.date'),
                class: 'text-left col-date',
                sorted: true,
                direction: 'desc'
            },
            {
                id: 'action',
                name: this.translateService.instant('logs.action'),
                class: 'text-left col-action'
            },
            {
                id: 'message',
                name: this.translateService.instant('logs.message'),
                class: 'text-left col-message'
            }
        ];
    }

    getNumberOfRecords(): number {
        return this.numberOfRecords;
    }
}

