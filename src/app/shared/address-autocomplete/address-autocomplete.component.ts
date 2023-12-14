import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteService } from './autocomplete.service';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';
import { AutocompleteAddress } from './autocomplete.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-autocomplete.component.html',
  styleUrl: './address-autocomplete.component.scss',
})
export class AddressAutocompleteComponent implements OnInit, OnDestroy {
  @Output() addressSelected = new EventEmitter<AutocompleteAddress>();
  autocompleteService = inject(AutocompleteService);
  elementRef = inject(ElementRef);
  searchText = '';
  filteredAddresses: AutocompleteAddress[] = [];
  #searchTerms = new Subject<string>();
  #searchSubscription!: Subscription;

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.filteredAddresses = [];
    }
  }

  ngOnInit(): void {
    this.#searchSubscription = this.#searchTerms.pipe(
      debounceTime(500),
      switchMap((term: string) => this.autocompleteService.autocomplete(term))
    ).subscribe((addresses: any[]) => {
      this.filteredAddresses = addresses;
    });
  }

  onInputChange(event: Event): void {
    this.#searchTerms.next((event.target as HTMLInputElement).value);
  }

  onFocus = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.#searchTerms.next(value);
    }
  }

  clearInput = () => {
    this.searchText = '';
    this.filteredAddresses = [];
  }

  selectAddress(address: AutocompleteAddress) {
    // Handle selection of the address, e.g., fill form fields
    this.searchText = address.formatted;
    this.filteredAddresses = []; // Clear the suggestions
    this.addressSelected.emit(address);
  }

  ngOnDestroy(): void {
    this.#searchSubscription.unsubscribe();
  }
}
