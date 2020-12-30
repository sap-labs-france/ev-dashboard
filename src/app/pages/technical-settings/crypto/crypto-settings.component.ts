import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import TenantComponents from 'types/TenantComponents';

@Component({
    selector: 'app-crypto-settings',
    templateUrl: 'crypto-settings.component.html',
})

export class CryptoSettingsComponent implements OnInit {
    public isActive = false;

    public formGroup!: FormGroup;

    constructor(
        private centralServerService: CentralServerService,
        private componentService: ComponentService,
        private spinnerService: SpinnerService,
        private messageService: MessageService,
        private router: Router,
    ) {
        this.isActive = this.componentService.isActive(TenantComponents.CRYPTO);
    }

    public ngOnInit(): void {
        // Build the form
        this.formGroup = new FormGroup({});
        // // Load the conf
        // this.loadConfiguration();
    }
}
