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
  templateUrl: './release-notes.html',
  styleUrls: ['./release-notes.scss']
})
export class ReleaseNotesComponent {
  // Release Notes
  public releaseNotes: ReleaseNotes[] = [
    {
      version: '2.0.1',
      date: new Date('2018-09-11'),
      componentChanges: [
        {
          name: 'Logs',
          changes: [
            'Added Details in Logs'
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
            'Implementation of Login/Register/Reset Password views'
          ]
        },
        {
          name: 'Logs',
          changes: [
            'Implementation of Log view with Filtering, Sorting and Pagination'
          ]
        },
        {
          name: 'Users',
          changes: [
            'Implementation of edit current logged user profile'
          ]
        }
      ]
    }
  ];

  constructor() {
  }
}
