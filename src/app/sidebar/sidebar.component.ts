import { Component, OnInit, OnDestroy } from '@angular/core';
import { CentralServerService } from '../service/central-server.service';
import { WebSocketService } from '../service/web-socket.service';
import { AuthorizationService } from '../service/authorization-service';
import { ConfigService } from '../service/config.service';
import { Router } from '@angular/router';
import { Constants } from '../utils/Constants';
import 'rxjs/add/operator/debounceTime';

declare const $: any;

// Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    collapse?: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

// Menu Items
export const ROUTES: RouteInfo[] = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'dashboard'
    }
];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
    public menuItems: any[];
    public loggedUser;
    public loggedUserImage = Constants.USER_NO_PICTURE;
    private userSubscription;
    public isAdmin = false;

    constructor(
            private configService: ConfigService,
            private router: Router,
            private authorizationService: AuthorizationService,
            private centralServerService: CentralServerService,
            private webSocketService: WebSocketService) {
        // Set admin
        this.isAdmin = this.authorizationService.isAdmin();
        // Get the logged user
        this.loggedUser = this.centralServerService.getLoggedUser();
        // Read user
        this.updateUserImage();
    }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        // Subscribe to user's change
        this.userSubscription = this.webSocketService.getSubjectUser().debounceTime(
                this.configService.getAdvanced().debounceTimeNotifMillis).subscribe((notifInfo) => {
            // Update user?
            if (notifInfo['data']['id'] === this.loggedUser.id) {
                // Deleted?
                if (notifInfo.action === Constants.NOTIF_ACTION_DELETE) {
                    // Log off user
                    this.signout();
                } else {
                    // Same user: Update it
                    this.updateUserImage();
                }
            }
        });
    }

    ngOnDestroy() {
        // Subscribe to user's change
        this.userSubscription.unsubscribe();
    }

    updateUserImage() {
        // Get the user's image
        this.centralServerService.getUserImage(this.loggedUser.id).subscribe((image) => {
            // Keep
            this.loggedUserImage = (image.image ? image.image : Constants.USER_NO_PICTURE).toString();
        });
    }

    public signout() {
        // Logoff
        this.centralServerService.logout().subscribe((result) => {
            // Clear
            this.centralServerService.logoutSucceeded();
            // Redirect to login page with the return url
            this.router.navigate(['/auth/login']);
        }, (error) => {
            // Clear
            this.centralServerService.logoutSucceeded();
            // Redirect to login page with the return url
            this.router.navigate(['/auth/login']);
        });
    }

    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

    logout() {
        // Logoff
        this.centralServerService.logout().subscribe(() => {
            // Clear
            this.centralServerService.logoutSucceeded();
            // Redirect to login page with the return url
            this.router.navigate(['/auth/login']);
        }, (error) => {
            // Clear
            this.centralServerService.logoutSucceeded();
            // Redirect to login page with the return url
            this.router.navigate(['/auth/login']);
        });
    }
}
