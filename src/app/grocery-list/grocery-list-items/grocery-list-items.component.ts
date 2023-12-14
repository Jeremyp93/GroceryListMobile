import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { style, transition, trigger, animate } from '@angular/animations';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LetDirective } from '@ngrx/component';

import { AnchorButtonComponent } from '../../shared/anchor-button/anchor-button.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { GroceryList } from '../types/grocery-list.type';
import { Select, Store } from '@ngxs/store';
import { GroceryListState } from '../ngxs-store/grocery-list.state';
import { AddGroceryList, DeleteGroceryList, GetGroceryLists, SetSelectedGroceryList } from '../ngxs-store/grocery-list.actions';
import { ButtonStyle } from '../../shared/button/button-style.enum';
import { GROCERY_LIST_FORM, ROUTES_PARAM } from '../../constants';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { LoadingSize } from '../../shared/loading/loading-size.enum';
import { LoadingColor } from '../../shared/loading/loading-color.enum';
import { LinkMapsStorePipe } from './link-maps-store.pipe';
import { ButtonHover } from '../../shared/button/button-hover.enum';
import { displayDateAsHuman } from '../../helpers/date.helper';
import { InputType } from '../../shared/input-field/input-type.enum';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';

@Component({
  selector: 'app-grocery-list-items',
  standalone: true,
  imports: [CommonModule, AnchorButtonComponent, RouterModule, ButtonComponent, HeaderComponent, ModalComponent, ReactiveFormsModule, LetDirective, LoadingComponent, LinkMapsStorePipe, InputFieldComponent],
  templateUrl: './grocery-list-items.component.html',
  styleUrl: './grocery-list-items.component.scss',
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
  ],
})
export class GroceryListItemsComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  ngStore = inject(Store);
  @Select(GroceryListState.getGroceryLists) groceryLists$!: Observable<GroceryList[]>;
  modalOpen: boolean = false;
  duplicateForm!: FormGroup;
  duplicateFormSubmitted = false;
  isLoading: boolean = false;
  #selectedList: GroceryList | null = null;

  get buttonStyles(): typeof ButtonStyle {
    return ButtonStyle;
  }

  get loadingSizes(): typeof LoadingSize {
    return LoadingSize;
  }

  get loadingColors(): typeof LoadingColor {
    return LoadingColor;
  }

  get hoverChoices(): typeof ButtonHover {
    return ButtonHover;
  }

  get inputTypes(): typeof InputType {
    return InputType;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.ngStore.dispatch(new GetGroceryLists()).subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
    this.#initForm();
  }

  displayCreatedAt = (createdAt: Date): string => {
    return displayDateAsHuman(createdAt);
  }

  selectList = (list: GroceryList) => {
    this.ngStore.dispatch(new SetSelectedGroceryList(list)).subscribe(() => this.router.navigate([ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST, list.id]));
  }

  newList = () => {
    this.router.navigate([ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST, ROUTES_PARAM.GROCERY_LIST.NEW]);
  }

  editList = (event: Event, list: GroceryList) => {
    this.preventPropagation(event);
    this.ngStore.dispatch(new SetSelectedGroceryList(list)).subscribe(() => this.router.navigate([ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST, list.id, ROUTES_PARAM.GROCERY_LIST.EDIT]));
  }

  showDeleteList = (event: Event, list: GroceryList) => {
    this.preventPropagation(event);
    list.showDelete = true;
  }

  deleteList = (event: Event, id: string) => {
    this.preventPropagation(event);
    this.ngStore.dispatch(new DeleteGroceryList(id));
  }

  cancelDeleteList = (event: Event, list: GroceryList) => {
    this.preventPropagation(event);
    list.showDelete = false;
  }

  openModal = (event: Event, list: GroceryList): void => {
    this.preventPropagation(event);
    this.#selectedList = list;
    this.modalOpen = true;
  }

  preventPropagation(event: Event): void {
    event.stopPropagation();
  }

  onSubmitDuplicateForm = async () => {
    this.duplicateFormSubmitted = true;
    if (this.duplicateForm.invalid) return;
    if (!this.#selectedList) return;
    this.isLoading = true;
    const name = this.duplicateForm.get(GROCERY_LIST_FORM.NAME)?.value;
    const list = { ...this.#selectedList, name: name };
    this.ngStore.dispatch(new AddGroceryList(list)).subscribe({
      next: () => {
        this.duplicateForm.reset();
        this.ngStore.dispatch(new SetSelectedGroceryList(null));
        this.duplicateFormSubmitted = this.isLoading = this.modalOpen = false;
      },
      error: () => {
        this.duplicateFormSubmitted = this.isLoading = false;
      }
    });
  }

  #initForm = () => {
    this.duplicateForm = new FormGroup({
      [GROCERY_LIST_FORM.NAME]: new FormControl('', Validators.required),
    });
  }
}
