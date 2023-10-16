import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { TableEditUserAction } from '../../../shared/table/actions/users/table-edit-user-action';
import { DialogMode } from '../../../types/Authorization';
import { User } from '../../../types/User';
import { UserDialogComponent } from '../user/user-dialog.component';
import { UserComponent } from '../user/user.component';
import { UsersListTableDataSource } from './users-list-table-data-source';

@Component({
  selector: 'app-users-list',
  template: '<app-table [dataSource]="usersListTableDataSource"></app-table>',
  providers: [UsersListTableDataSource, UserComponent],
})
export class UsersListComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public usersListTableDataSource: UsersListTableDataSource,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    let userID: string = null;
    // Check we are in /users/id route and get User ID if so or don't go further if user not authorize to update
    if (this.activatedRoute.snapshot.params['id'] && !this.authorizationService.canUpdateUser()) {
      void this.router.navigate(['/']);
    } else if (this.activatedRoute.snapshot.params['id']) {
      this.activatedRoute.params.subscribe((params: Params) => {
        userID = params['id'];
      });
      // Edit the user
      const editAction = new TableEditUserAction().getActionDef();
      editAction.action(UserDialogComponent, this.dialog, {
        dialogData: { id: userID } as User,
        dialogMode: DialogMode.EDIT,
      });
    }
  }
}
