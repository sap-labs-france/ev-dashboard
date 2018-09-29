import { Component } from '@angular/core';

interface ReleaseNotes {
  version: string;
  date: Date;
  componentChanges: ComponentChange[];
}

interface ComponentChange {
  name: string;
  changes: String []
}

@Component({
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {
  // Release Notes
  public releaseNotes: ReleaseNotes[] = [
    {
      version: '2.0.3',
      date: new Date('2018-09-28'),
      componentChanges: [
        {
          name: 'Account Activation',
          changes: [
            `Account activation`,
            `Resend account activation via email`
          ]
        }
      ]
    },
    {
      version: '2.0.1',
      date: new Date('2018-09-11'),
      componentChanges: [
        {
          name: 'Logs',
          changes: [
            `Added Details section`
          ]
        }
      ]
    },
    {
      version: '2.0.0',
      date: new Date('2018-09-07'),
      componentChanges: [
        {
          name: 'Authentication',
          changes: [
            `Implementation of Log in, Register and Reset Password views`
          ]
        },
        {
          name: 'Logs',
          changes: [
            `Implementation of Logs view with Filtering, Sorting and Pagination`
          ]
        },
        {
          name: 'Users',
          changes: [
            `Implementation of user's profile edition`
          ]
        }
      ]
    }
  ];
}
