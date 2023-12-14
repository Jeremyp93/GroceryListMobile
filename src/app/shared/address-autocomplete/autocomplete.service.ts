import { Observable, of } from "rxjs";
import { AutocompleteAddress } from "./autocomplete.type";
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AutocompleteService {
    httpClient = inject(HttpClient);

    autocomplete = (searchInput: string): Observable<AutocompleteAddress[]> => {
        if (!searchInput) {
            return of([]);
        }
        return this.httpClient.get<AutocompleteAddress[]>(`${environment.autocompleteApiUrl}?searchText=${searchInput}`);
    }
}