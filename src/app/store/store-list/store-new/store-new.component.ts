import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, lastValueFrom } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { v4 as UUID } from 'uuid';

import { HeaderComponent } from '../../../shared/header/header.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ButtonHover } from '../../../shared/button/button-hover.enum';
import { ROUTES_PARAM, SECTION_FORM, STORE_FORM } from '../../../constants';
import { LoadingSize } from '../../../shared/loading/loading-size.enum';
import { LoadingColor } from '../../../shared/loading/loading-color.enum';
import { ButtonStyle } from '../../../shared/button/button-style.enum';
import { AddressAutocompleteComponent } from '../../../shared/address-autocomplete/address-autocomplete.component';
import { AutocompleteAddress } from '../../../shared/address-autocomplete/autocomplete.type';
import { Store as NgxsStore } from '@ngxs/store';
import { AddStore, GetSelectedStore, SetSelectedStore, UpdateStore } from '../../ngxs-store/store.actions';
import { StoreState } from '../../ngxs-store/store.state';
import { Store } from '../../types/store.type';
import { Section } from '../../types/section.type';
import { InputFieldComponent } from '../../../shared/input-field/input-field.component';
import { InputType } from '../../../shared/input-field/input-type.enum';

@Component({
  selector: 'app-store-new',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, ReactiveFormsModule, LoadingComponent, AddressAutocompleteComponent, InputFieldComponent],
  templateUrl: './store-new.component.html',
  styleUrl: './store-new.component.scss'
})
export class StoreNewComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  ngxsStore = inject(NgxsStore);
  router = inject(Router);
  title: string = 'Add Store';
  storeForm!: FormGroup;
  isLoading: boolean = false;
  submitted: boolean = false;
  #routeSubscription!: Subscription;
  idToEdit: string | null = null;
  editMode: boolean = false;
  validationInProgress: boolean = false;
  showAddressFields: boolean = false;

  //@ViewChildren('inputFields') inputFields!: QueryList<ElementRef>;
  @ViewChildren('inputFields', { read: InputFieldComponent }) inputFields!: QueryList<InputFieldComponent>;

  get hoverChoices(): typeof ButtonHover {
    return ButtonHover;
  }
  get loadingSizes(): typeof LoadingSize {
    return LoadingSize;
  }
  get loadingColors(): typeof LoadingColor {
    return LoadingColor;
  }
  get buttonStyles(): typeof ButtonStyle {
    return ButtonStyle;
  }
  get sectionControls() {
    return (this.storeForm.get(STORE_FORM.SECTIONS) as FormArray).controls;
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
      this.title = `${this.editMode ? 'Edit' : 'Add'} Store`;
      this.#initForm();
    });
  }

  onSubmit = () => {
    this.submitted = true;
    if (this.storeForm.invalid) return;
    this.isLoading = true;
    if (this.editMode) {
      if (!this.storeForm.pristine) {
        this.#setPriorities();
        this.ngxsStore.dispatch(new UpdateStore(this.storeForm.value, this.idToEdit!)).subscribe({
          next: () => {
            const updatedStore = this.ngxsStore.selectSnapshot(StoreState.getLastUpdatedStore);
            this.ngxsStore.dispatch(new SetSelectedStore(updatedStore)).subscribe(() => this.#back());
          },
          error: () => this.isLoading = false
        });
      } else {
        this.#back();
      }
    } else {
      this.#setPriorities();
      this.ngxsStore.dispatch(new AddStore(this.storeForm.value)).subscribe({
        next: () => this.#back(),
        error: () => this.isLoading = false
      });
    }
  }

  onAddSection = () => {
    const sections = this.storeForm.get(STORE_FORM.SECTIONS) as FormArray;
    sections.insert(0, new FormGroup({
      [SECTION_FORM.ID]: new FormControl(UUID()),
      [SECTION_FORM.NAME]: new FormControl(null, Validators.required),
      [SECTION_FORM.PRIORITY]: new FormControl(0),
    }));
    setTimeout(() => {
      this.#focusOnControl(0);
    }, 100);
  }

  onEnterPressed = (event: KeyboardEvent | Event) => {
    event.preventDefault();
    this.onAddSection();
  }

  onDeleteSection = (id: string) => {
    const sections = this.storeForm.get(STORE_FORM.SECTIONS) as FormArray;
    const index = sections.controls.findIndex(c => c.get(SECTION_FORM.ID)?.value === id);
    sections.removeAt(index);
    this.storeForm.markAsDirty();
  }

  addAddressToForm = (address: AutocompleteAddress) => {
    this.storeForm.patchValue({
      [STORE_FORM.STREET]: address.houseNumber ? `${address.houseNumber} ${address.street}` : address.street,
      [STORE_FORM.ZIPCODE]: address.zipCode,
      [STORE_FORM.CITY]: address.city,
      [STORE_FORM.COUNTRY]: address.country
    });
    this.showAddressFields = true;
    this.storeForm.markAsDirty();
  }

  ngOnDestroy(): void {
    this.#routeSubscription.unsubscribe();
  }

  #initForm = async () => {
    if (this.editMode) {
      const store = this.ngxsStore.selectSnapshot(StoreState.getSelectedStore);
      if (!store) {
        await lastValueFrom(this.ngxsStore.dispatch(new GetSelectedStore(this.idToEdit!)));
        const list = this.ngxsStore.selectSnapshot(StoreState.getSelectedStore);
        this.#setupEditForm(list!);
        return;
      }

      this.#setupEditForm(store!);
    }else {
      this.#setupForm('', '', '', '', '', new FormArray<any>([]));
    }
  }

  #setupEditForm = (store: Store) => {
    if (store.street || store.zipCode || store.city || store.country) {
      this.showAddressFields = true;
    }
    let sections: FormArray<any> = new FormArray<any>([]);
    if (store.sections.length > 0) {
      store.sections.forEach((section: Section) => {
        sections.push(new FormGroup({
          [SECTION_FORM.ID]: new FormControl(UUID()),
          [SECTION_FORM.NAME]: new FormControl(section.name, Validators.required),
          [SECTION_FORM.PRIORITY]: new FormControl(section.priority, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
        }));
      });
    }

    this.#setupForm(store.name, store.street, store.zipCode, store.city, store.country, sections);
  }

  #setupForm = (name: string, street: string, zipCode: string, city: string, country: string, sections: FormArray) => {
    this.storeForm = new FormGroup({
      [STORE_FORM.NAME]: new FormControl(name, Validators.required),
      [STORE_FORM.STREET]: new FormControl(street),
      [STORE_FORM.ZIPCODE]: new FormControl(zipCode),
      [STORE_FORM.CITY]: new FormControl(city),
      [STORE_FORM.COUNTRY]: new FormControl(country),
      [STORE_FORM.SECTIONS]: sections
    });
  }

  #focusOnControl = (index: number) => {
    const elements = this.inputFields.toArray();
    if (elements[index]) {
      elements[index].focusInput();
    }
  }

  #setPriorities = () => {
    const sections = this.storeForm.get(STORE_FORM.SECTIONS) as FormArray;
    for (let index = 0; index < sections.controls.length; index++) {
      const sectionControl = sections.controls[index];
      sectionControl.get(SECTION_FORM.PRIORITY)?.setValue(index+1);
    }
  }

  #back = () => {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
