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
      version: '2.0.4',
      date: new Date('2018-10-10'),
      componentChanges: [
        {
          name: 'Tenant Management',
          changes: [
            `Implemented Super Admin role`,
            `Implemented Tenant Management (only visible to users with Super Admin role)`
          ]
        },
        {
          name: 'Unit Test',
          changes: [
            `Implemented Unit Tests framework`,
            `Delivered Unit Test: User Registration`
          ]
        }
      ]
    },
    {
      version: '2.0.3',
      date: new Date('2018-09-29'),
      componentChanges: [
        {
          name: 'Account Activation',
          changes: [
            `Implemented automatic Account activation (via email)`,
            `Resend Account activation link via email (in case of the first email is lost)`
          ]
        },
        {
          name: 'Logs',
          changes: [
            `Added hi-avail pop-up filter`,
            `Added User's pop-up filter`,
            `Added Charger's pop-up filter`
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
