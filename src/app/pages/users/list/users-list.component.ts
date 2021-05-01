import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogMode } from 'types/Authorization';
import { User } from 'types/User';

import { AuthorizationService } from '../../../services/authorization.service';
import { TableEditUserAction } from '../../../shared/table/actions/users/table-edit-user-action';
import { UserComponent } from '../user/user.component';
import { UserDialogComponent } from '../user/user.dialog.component';
import { UsersListTableDataSource } from './users-list-table-data-source';

@Component({
  selector: 'app-users-list',
  template: '<app-table [dataSource]="usersListTableDataSource"></app-table>',
  providers: [UsersListTableDataSource, UserComponent],
})
export class UsersListComponent implements OnInit {
  public isAdmin: boolean;

  public constructor(
    public usersListTableDataSource: UsersListTableDataSource,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  public ngOnInit(): void {
    let userID: string = null;
    // Check we are in /users/id route and get User ID if so or don't go further if user not authorize to update
    if (this.activatedRoute.snapshot.params['id'] &&
        !this.authorizationService.canUpdateUser()) {
      this.router.navigate(['/']);
    } else if (this.activatedRoute.snapshot.params['id']) {
      this.activatedRoute.params.subscribe((params: Params) => {
        userID = params['id'];
      });
      // Edit the user
      const editAction = new TableEditUserAction().getActionDef();
      editAction.action(UserDialogComponent, this.dialog, {
        dialogData: { id: userID } as User,
        dialogMode: DialogMode.EDIT
      });
    }
  }
}
