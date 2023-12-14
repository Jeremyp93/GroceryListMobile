import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, lastValueFrom, take } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select, Store as NgxsStore } from '@ngxs/store';

import { GroceryListService } from '../grocery-list.service';
import { TileIngredientComponent } from './tile-ingredient/tile-ingredient.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { TileAddIngredientComponent } from './tile-add-ingredient/tile-add-ingredient.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Ingredient } from '../types/ingredient.type';
import { Store } from '../../store/types/store.type';
import { Section } from '../../store/types/section.type';
import { IngredientState } from '../ngxs-store/ingredient.state';
import { AddIngredient, DeleteIngredient, ResetIngredients, SaveIngredients, SelectIngredient } from '../ngxs-store/ingredient.actions';
import { AddGroceryList, GetSelectedGroceryList } from '../ngxs-store/grocery-list.actions';
import { GroceryListState } from '../ngxs-store/grocery-list.state';
import { ButtonStyle } from '../../shared/button/button-style.enum';
import { ROUTES_PARAM, GROCERY_LIST_FORM } from '../../constants';
import { LoadingSize } from '../../shared/loading/loading-size.enum';
import { LoadingColor } from '../../shared/loading/loading-color.enum';
import { ComponentCanDeactivate } from '../../guards/pending-changes-guard.service';
import { GetStores } from '../../store/ngxs-store/store.actions';
import { StoreState } from '../../store/ngxs-store/store.state';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { InputType } from '../../shared/input-field/input-type.enum';

@Component({
  selector: 'app-grocery-list-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TileIngredientComponent, HeaderComponent, ButtonComponent, LoadingComponent, ReactiveFormsModule, ModalComponent, LoadingComponent, InputFieldComponent],
  templateUrl: './grocery-list-details.component.html',
  styleUrl: './grocery-list-details.component.scss',
  animations: [
    trigger('tileFadeSlideOut', [
      transition(':leave', [
        animate('300ms', style({ transform: 'translateX(100%)' })),
      ]),
    ])
  ]
})
export class GroceryListDetailsComponent implements OnInit, OnDestroy, ComponentCanDeactivate  {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer!: ViewContainerRef;
  route = inject(ActivatedRoute);
  router = inject(Router);
  groceryListService = inject(GroceryListService);
  ngStore = inject(NgxsStore);
  @Select(IngredientState.getIngredients) ingredients$!: Observable<Ingredient[]>;
  @Select(StoreState.getSections) sections$!: Observable<Section[]>;
  @Select(StoreState.getStores) stores$!: Observable<Store[]>;
  id = '';
  sections: Section[] = [];
  title: string = 'Ingredients to buy';
  saved: boolean = false;
  isLoading: boolean = false;
  itemAddedSubscription: Subscription | null = null;
  addFormClosedSubscription: Subscription | null = null;
  modalOpen: boolean = false;
  exportForm!: FormGroup;
  exportFormSubmitted: boolean = false;
  storeId: string | undefined;
  saveProcess: boolean = false;
  #routeSubscription: Subscription | null = null;
  #pendingChanges: boolean = false;

  get buttonStyles(): typeof ButtonStyle {
    return ButtonStyle;
  }
  get loadingSizes(): typeof LoadingSize {
    return LoadingSize;
  }
  get loadingColors(): typeof LoadingColor {
    return LoadingColor;
  }
  get inputTypes(): typeof InputType {
    return InputType;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.#pendingChanges;
  }

  ngOnInit(): void {
    this.isLoading = true;
    const selectedGroceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
    if (selectedGroceryList) {
      this.id = selectedGroceryList.id;
      this.storeId = selectedGroceryList.store?.id;
      this.title = selectedGroceryList.name;
      this.initForm();
      this.isLoading = false;
      return;
    }

    this.#routeSubscription = this.route.params.subscribe(async (params: Params) => {
      this.id = params[ROUTES_PARAM.ID_PARAMETER];
      try {
        await lastValueFrom(this.ngStore.dispatch(new GetSelectedGroceryList(this.id)));
      } catch {
        this.isLoading = false;
        return;
      }
      const selectedGroceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
      if (!selectedGroceryList) {
        this.isLoading = false;
        return;
      }
      this.storeId = selectedGroceryList.store?.id;
      this.title = selectedGroceryList.name;
      this.initForm();
      this.isLoading = false;
    });

    /* this.#routeSubscription = this.route.params.subscribe(async (params: Params) => {
      this.id = params[ROUTES_PARAM.ID_PARAMETER];
      let selectedGroceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
      if (!selectedGroceryList) {
        await lastValueFrom(this.ngStore.dispatch(new GetSelectedGroceryList(this.id)));
        selectedGroceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
        if (!selectedGroceryList) {
          this.isLoading = false;
          return;
        }
      }
      this.storeId = selectedGroceryList.store?.id;
      this.title = selectedGroceryList.name;
      this.initForm();
      this.isLoading = false;
    }); */
  }

  back = () => {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  putInBasket = (id: string) => {
    this.ngStore.dispatch(new SelectIngredient(id)).subscribe(() => this.#pendingChanges = true);
  }

  resetIngredients = () => {
    this.ngStore.dispatch(new ResetIngredients()).subscribe(() => this.#pendingChanges = true);
  }

  newIngredient = () => {
    const componentRef = this.dynamicComponentContainer.createComponent(TileAddIngredientComponent);
    this.sections$.pipe(take(1)).subscribe(sections => {
      componentRef.setInput('sections', sections);
      this.itemAddedSubscription = componentRef.instance.itemAdded.subscribe(ingredient => {
        this.ngStore.dispatch(new AddIngredient(ingredient)).subscribe(() => {
          this.#pendingChanges = true
          this.itemAddedSubscription?.unsubscribe();
          this.dynamicComponentContainer.clear();
        });
      });
      setTimeout(() => {
        this.addFormClosedSubscription = componentRef.instance.onClickOutside.subscribe(_ => {
          this.addFormClosedSubscription?.unsubscribe();
          this.dynamicComponentContainer.clear();
        });
      });
    });
  }

  deleteIngredient = (id: string) => {
    this.ngStore.dispatch(new DeleteIngredient(id)).subscribe(() => this.#pendingChanges = true);
  }

  editGroceryList = () => {
    this.router.navigate([ROUTES_PARAM.GROCERY_LIST.EDIT], { relativeTo: this.route });
  }

  saveIngredients = async () => {
    this.saveProcess = true;
    this.ngStore.dispatch(new SaveIngredients(this.id)).subscribe({
      next: () => {
        this.saveProcess = this.#pendingChanges = false;
        this.saved = true;
        setTimeout(() => {
          this.saved = false;
        }, 1000);
      },
      error: () => {
        this.saveProcess = false;
      }
    });
  }

  exportToNewList = async (event: Event) => {
    event.stopPropagation();
    this.ngStore.dispatch(new GetStores()).subscribe(() => {this.modalOpen = true});
  }

  onSubmitExportForm = async () => {
    const name = this.exportForm.value.name;
    const storeId = this.exportForm.value.storeId;
    this.exportFormSubmitted = true;
    if (this.exportForm.invalid) return;
    const groceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
    this.ingredients$.pipe(take(1)).subscribe(ingredients => {
      const newList = { ...groceryList, name: name, storeId: storeId, ingredients: [...ingredients.filter(i => !i.selected)] };
      this.ngStore.dispatch(new AddGroceryList(newList)).subscribe(_ => {
        this.exportForm.reset();
        this.exportFormSubmitted = false;
        this.back();
      });
    });
  }

  initForm = () => {
    this.exportForm = new FormGroup({
      [GROCERY_LIST_FORM.NAME]: new FormControl('', Validators.required),
      [GROCERY_LIST_FORM.STORE_ID]: new FormControl(this.storeId ?? '')
    });
  }

  ngOnDestroy(): void {
    if (this.#routeSubscription) {
      this.#routeSubscription.unsubscribe();
    }
    if (this.itemAddedSubscription) {
      this.itemAddedSubscription.unsubscribe();
    }
    if (this.addFormClosedSubscription) {
      this.addFormClosedSubscription.unsubscribe();
    }
  }
}
