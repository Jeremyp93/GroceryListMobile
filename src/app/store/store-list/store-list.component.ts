import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select, Store as NgxsStore } from '@ngxs/store';
import { DeleteStore, GetStores, SetSelectedStore } from '../ngxs-store/store.actions';
import { StoreState } from '../ngxs-store/store.state';
import { Observable } from 'rxjs';
import { Store } from '../types/store.type';
import { ButtonComponent } from '../../shared/button/button.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonHover } from '../../shared/button/button-hover.enum';
import { LetDirective } from '@ngrx/component';
import { displayDateAsHuman } from '../../helpers/date.helper';
import { ButtonStyle } from '../../shared/button/button-style.enum';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ROUTES_PARAM } from '../../constants';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, HeaderComponent, LetDirective, RouterModule],
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.scss',
  animations: [
      trigger('deleteFadeSlideInOut', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateX(20%)' }),
          animate('300ms', style({ opacity: 1, transform: 'translateX(0)' })),
        ]),
        transition(':leave', [
          animate('300ms', style({ opacity: 0, transform: 'translateX(20%)' })),
        ]),
      ]),
      trigger('tileFadeSlideOut', [
        transition(':leave', [
          animate('300ms', style({ transform: 'translateX(100%)' })),
        ]),
      ])
  ]
})
export class StoreListComponent implements OnInit {
  ngxsStore = inject(NgxsStore);
  router = inject(Router);
  @Select(StoreState.getStores) stores$!: Observable<Store[]>;

  get hoverChoices(): typeof ButtonHover {
    return ButtonHover;
  }

  get buttonStyles(): typeof ButtonStyle {
    return ButtonStyle;
  }

  ngOnInit(): void {
    this.ngxsStore.dispatch(new GetStores());
  }

  newStore = () => {
    this.router.navigate([ROUTES_PARAM.STORE.STORE, ROUTES_PARAM.STORE.NEW]);
  }

  delete = (event: Event, id: string) => {
    event.stopPropagation();
    this.ngxsStore.dispatch(new DeleteStore(id));
  }

  cancelDelete = (event: Event, store: Store) => {
    event.stopPropagation();
    store.showDelete = false;
  }

  displayCreatedAt = (createdAt: Date): string => {
    return displayDateAsHuman(createdAt);
  }

  showDelete = (event: Event, store: Store) => {
    event.stopPropagation();
    store.showDelete = true;
  }

  selectStore = (store: Store) => {
    this.ngxsStore.dispatch(new SetSelectedStore(store)).subscribe(() => this.router.navigate([ROUTES_PARAM.STORE.STORE, store.id]));
  }

  editStore = (event: Event, store: Store) => {
    event.stopPropagation();
    this.ngxsStore.dispatch(new SetSelectedStore(store)).subscribe(() => this.router.navigate([ROUTES_PARAM.STORE.STORE, store.id, ROUTES_PARAM.STORE.EDIT]));
  }
}
