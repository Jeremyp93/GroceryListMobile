import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { v4 as UUID } from 'uuid';
import { Store as NgxsStore, Select } from '@ngxs/store';

import { HeaderComponent } from '../../../shared/header/header.component';
import { StoreService } from '../../../store/store.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { GroceryListService } from '../../grocery-list.service';
import { Ingredient } from '../../types/ingredient.type';
import { Store } from '../../../store/types/store.type';
import { AddGroceryList, GetSelectedGroceryList, SetSelectedGroceryList, UpdateGroceryList } from '../../ngxs-store/grocery-list.actions';
import { ButtonStyle } from '../../../shared/button/button-style.enum';
import { ROUTES_PARAM, GROCERY_LIST_FORM, INGREDIENT_FORM } from '../../../constants';
import { GroceryListState } from '../../ngxs-store/grocery-list.state';
import { GroceryList } from '../../types/grocery-list.type';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { LoadingSize } from '../../../shared/loading/loading-size.enum';
import { LoadingColor } from '../../../shared/loading/loading-color.enum';
import { ButtonHover } from '../../../shared/button/button-hover.enum';
import { GetStores } from '../../../store/ngxs-store/store.actions';
import { StoreState } from '../../../store/ngxs-store/store.state';
import { InputFieldComponent } from '../../../shared/input-field/input-field.component';
import { InputType } from '../../../shared/input-field/input-type.enum';

@Component({
  selector: 'app-grocery-list-new',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, ReactiveFormsModule, LoadingComponent, InputFieldComponent],
  templateUrl: './grocery-list-new.component.html',
  styleUrl: './grocery-list-new.component.scss'
})
export class GroceryListNewComponent implements OnInit, OnDestroy {
  storeService = inject(StoreService);
  groceryListService = inject(GroceryListService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  ngStore = inject(NgxsStore);
  @Select(StoreState.getStores) stores$!: Observable<Store[]>;
  groceryListForm!: FormGroup;
  categories: string[] = [];
  editMode: boolean = false;
  idToEdit: string | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  title: string = '';
  #routeSubscription!: Subscription;

  //@ViewChildren('inputFields') inputFields!: QueryList<ElementRef>;
  @ViewChildren('inputFields', { read: InputFieldComponent }) inputFields!: QueryList<InputFieldComponent>;

  get ingredientControls() { // a getter!
    return (this.groceryListForm.get(GROCERY_LIST_FORM.INGREDIENTS) as FormArray).controls;
  }

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
    this.#routeSubscription = this.route.params.subscribe(async (params: Params) => {
      this.idToEdit = params[ROUTES_PARAM.ID_PARAMETER];
      if (this.idToEdit) {
        this.editMode = true;
      }
      this.title = `${this.editMode ? 'Edit' : 'Add'} Grocery List`;
      this.ngStore.dispatch(new GetStores());
      await this.#initForm();
    });
  }

  onAddIngredient = () => {
    const ingredients = this.groceryListForm.get(GROCERY_LIST_FORM.INGREDIENTS) as FormArray;
    ingredients.insert(0, new FormGroup({
      [INGREDIENT_FORM.ID]: new FormControl(UUID()),
      [INGREDIENT_FORM.NAME]: new FormControl(null, Validators.required),
      [INGREDIENT_FORM.AMOUNT]: new FormControl("1", [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
      [INGREDIENT_FORM.CATEGORY]: new FormControl("")
    }));
    setTimeout(() => {
      this.#focusOnControl(0);
    }, 100);
  }

  onDeleteIngredient = (id: string) => {
    const ingredients = this.groceryListForm.get(GROCERY_LIST_FORM.INGREDIENTS) as FormArray;
    const index = ingredients.controls.findIndex(c => c.get(INGREDIENT_FORM.ID)?.value === id);
    ingredients.removeAt(index);
    this.groceryListForm.markAsDirty();
  }

  onSubmit = () => {
    this.submitted = true;
    if (this.groceryListForm.invalid) return;
    this.isLoading = true;
    if (this.editMode) {
      if (!this.groceryListForm.pristine) {
        this.ngStore.dispatch(new UpdateGroceryList(this.groceryListForm.value, this.idToEdit!)).subscribe({
          next: () => {
            const updatedList = this.ngStore.selectSnapshot(GroceryListState.getLastUpdatedGroceryList);
            this.ngStore.dispatch(new SetSelectedGroceryList(updatedList)).subscribe(() => this.#back());
          },
          error: () => this.isLoading = false
        });
      } else {
        this.#back();
      }
    } else {
      this.ngStore.dispatch(new AddGroceryList(this.groceryListForm.value)).subscribe({
        next: () => this.#back(),
        error: () => this.isLoading = false
      });
    }
  }

  onChangeStore = async (event: Event) => {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (!selectedValue) {
      this.categories = [];
      return;
    }
    const store = await lastValueFrom(this.storeService.getStoreById(selectedValue));
    this.categories = store.sections.map(s => s.name);
  }

  onEnterPressed = (event: KeyboardEvent | Event) => {
    event.preventDefault();
    this.onAddIngredient();
  }

  ngOnDestroy(): void {
    this.#routeSubscription.unsubscribe();
  }

  #initForm = async () => {
    if (this.editMode) {
      const groceryList = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
      if (!groceryList) {
        await lastValueFrom(this.ngStore.dispatch(new GetSelectedGroceryList(this.idToEdit!)));
        const list = this.ngStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
        this.#setupEditForm(list!);
        return;
      }

      this.#setupEditForm(groceryList!);
    } else {
      this.#setupForm('', '', new FormArray<any>([]));
    }
  }

  #setupEditForm = (groceryList: GroceryList) => {
    const name = groceryList.name;
    let storeId = '';
    let ingredients: FormArray<any> = new FormArray<any>([]);
    if (groceryList.store) {
      storeId = groceryList.store.id;
      this.categories = groceryList.store.sections.map(s => s.name);
    }
    if (groceryList.ingredients.length > 0) {
      groceryList.ingredients.forEach((ingredient: Ingredient) => {
        ingredients.push(new FormGroup({
          [INGREDIENT_FORM.ID]: new FormControl(UUID()),
          [INGREDIENT_FORM.NAME]: new FormControl(ingredient.name, Validators.required),
          [INGREDIENT_FORM.AMOUNT]: new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
          [INGREDIENT_FORM.CATEGORY]: new FormControl(ingredient.category)
        }));
      });
    }

    this.#setupForm(name, storeId, ingredients);
  }

  #setupForm = (name: string, storeId: string, ingredients: FormArray) => {
    this.groceryListForm = new FormGroup({
      [GROCERY_LIST_FORM.NAME]: new FormControl(name, Validators.required),
      [GROCERY_LIST_FORM.STORE_ID]: new FormControl(storeId),
      [GROCERY_LIST_FORM.INGREDIENTS]: ingredients,
    });
  }

  #focusOnControl = (index: number) => {
    const elements = this.inputFields.toArray();
    if (elements[index]) {
      elements[index].focusInput();
    }
  }

  #back = () => {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
