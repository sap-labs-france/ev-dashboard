import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-retrieve-password-cmp',
    templateUrl: './retrieve-password.component.html'
})

export class RetrievePasswordComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    ngOnInit() {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('lock-page');
      body.classList.add('off-canvas-sidebar');
      const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('lock-page');
      body.classList.remove('off-canvas-sidebar');
    }
}
