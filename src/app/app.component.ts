import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ROUTES_PARAM } from './constants';
import { AuthState } from './auth/ngxs-store/auth.state';
import { Logout } from './auth/ngxs-store/auth.actions';
import { AlertComponent } from './shared/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  router = inject(Router);
  actions = inject(Actions);
  ngxsStore = inject(Store);
  @Select(AuthState.getName) name$!: Observable<string>;
  isKeyboardOpen = false;
  previousHeight: number = 0;
  groceryListRoute: string = '/' + ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST;
  storeRoute: string = '/' + ROUTES_PARAM.STORE.STORE;
  showMenu: boolean = false;

  @HostListener('window:resize')
  onResize() {
    const currentHeight = window.innerHeight;
    const heightDifference = Math.abs(currentHeight - this.previousHeight);

    const threshold = 300;

    if (heightDifference > threshold) {
      if (currentHeight < this.previousHeight) {
        this.isKeyboardOpen = true;
      } else {
        this.isKeyboardOpen = false;
      }
      this.previousHeight = currentHeight;
    }
  }

  ngOnInit() {
    this.actions.pipe(ofActionDispatched(Logout)).subscribe(() => {
      this.router.navigate([`/${ROUTES_PARAM.AUTHENTICATION.LOGIN}`]);
    });

    this.ngxsStore.select(AuthState.isAuthenticated).subscribe(value => this.showMenu = value);
  }

  onLogout = () => {
    this.ngxsStore.dispatch(new Logout());
  }
}
