import { HttpClient} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";

import { GroceryListRequestDto, GroceryListResponseDto } from "./dtos/grocery-list-dto.type";
import { GroceryList } from "./types/grocery-list.type";
import { IngredientDto } from "./dtos/ingredient-dto.type";
import { Ingredient } from "./types/ingredient.type";
import { environment } from "../../../src/environments/environment";

@Injectable({ providedIn: 'root' })
export class GroceryListService {
    httpClient = inject(HttpClient);

    getAllGroceryLists = (): Observable<GroceryList[]> => {
        return this.httpClient.get<GroceryListResponseDto[]>(environment.groceryListApiUrl)
            .pipe(
                map((listsDto: GroceryListResponseDto[]) => {
                    // Map DTOs to application type
                    return listsDto.map((dto: GroceryListResponseDto) => (this.#fromDto(dto)));
                })
            );
    }

    getGroceryList = (id: string): Observable<GroceryList> => {
        return this.httpClient.get<GroceryListResponseDto>(`${environment.groceryListApiUrl}/${id}`).pipe(map((dto: GroceryListResponseDto) => {
            return this.#fromDto(dto);
        }));
    }

    addGroceryList = (list: GroceryListRequestDto): Observable<GroceryList> => {
        return this.httpClient.post<GroceryListResponseDto>(environment.groceryListApiUrl, list).pipe(map((createdListDto: GroceryListResponseDto) => {
            return this.#fromDto(createdListDto);
        }));
    }

    deleteGroceryList = (id: string): Observable<void> => {
        return this.httpClient.delete<void>(`${environment.groceryListApiUrl}/${id}`);
    }

    updateGroceryList = (id: string, list: GroceryListRequestDto): Observable<GroceryList> => {
        return this.httpClient.put<GroceryListResponseDto>(`${environment.groceryListApiUrl}/${id}`, list).pipe(map((updatedListDto: GroceryListResponseDto) => {
            return this.#fromDto(updatedListDto);
        }));
    }

    updateIngredients = (id: string, ingredients: Ingredient[]): Observable<Ingredient[]> => {
        return this.httpClient.put<IngredientDto[]>(`${environment.groceryListApiUrl}/${id}/ingredients`, ingredients).pipe(map((ingredientsDto: IngredientDto[]) => {
            return ingredientsDto.map((dto: IngredientDto) => (this.#fromIngredientDto(dto)));
        }));
    }

    #fromDto = (dto: GroceryListResponseDto): GroceryList => {
        return {
            id: dto.id,
            name: dto.name,
            store: dto.store,
            ingredients: dto.ingredients.map(i => ({ id: '', name: i.name, amount: i.amount, category: i.category, selected: i.selected })),
            createdAt: dto.createdAt,
            showDelete: false
        };
    }

    #fromIngredientDto = (dto: IngredientDto): Ingredient => {
        return {
            id: '',
            name: dto.name,
            amount: dto.amount,
            category: dto.category,
            selected: dto.selected
        };
    }
}



