import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";

import { Store } from "./types/store.type";
import { environment } from "../../../src/environments/environment";
import { StoreRequestDto, StoreResponseDto } from "./dtos/store.dto";
import { Section } from "./types/section.type";
import { SectionDto } from "./dtos/section.dto";

@Injectable({ providedIn: 'root' })
export class StoreService {
    httpClient = inject(HttpClient);

    getAllStores = (): Observable<Store[]> => {
        return this.httpClient.get<StoreResponseDto[]>(environment.storeApiUrl).pipe(map((dtos) => {
            return dtos.map(dto => (this.#fromStoreDto(dto)));
        }));
    }

    getStoreById = (id: string): Observable<Store> => {
        return this.httpClient.get<StoreResponseDto>(`${environment.storeApiUrl}/${id}`).pipe(map((dto) => this.#fromStoreDto(dto)));
    }

    deleteStore = (id: string): Observable<void> => {
        return this.httpClient.delete<void>(`${environment.storeApiUrl}/${id}`);
    }

    addStore = (store: Store): Observable<Store> => {
        return this.httpClient.post<StoreResponseDto>(environment.storeApiUrl, this.#toStoreDto(store)).pipe(map((createdStoreDto: StoreResponseDto) => {
            return this.#fromStoreDto(createdStoreDto);
        }));
    }

    updateStore = (id: string, store: Store): Observable<Store> => {
        return this.httpClient.put<StoreResponseDto>(`${environment.storeApiUrl}/${id}`, this.#toStoreDto(store)).pipe(map((updatedStoreDto: StoreResponseDto) => {
            return this.#fromStoreDto(updatedStoreDto);
        }));
    }

    updateSections = (id: string, sections: Section[]): Observable<Section[]> => {
        return this.httpClient.put<SectionDto[]>(`${environment.storeApiUrl}/${id}/sections`, sections).pipe(map((sectionsDto: SectionDto[]) => {
            return sectionsDto.map((dto: SectionDto) => (this.#fromSectionDto(dto)));
        }));
    }

    #fromStoreDto = (dto: StoreResponseDto): Store => {
        return {
            id: dto.id,
            name: dto.name,
            street: dto.street,
            city: dto.city,
            country: dto.country,
            zipCode: dto.zipCode,
            sections: dto.sections,
            createdAt: dto.createdAt,
            showDelete: false
        }
    }

    #toStoreDto = (store: Store): StoreRequestDto => {
        return {
            name: store.name,
            street: store.street,
            city: store.city,
            country: store.country,
            zipCode: store.zipCode,
            sections: store.sections
        }
    }

    #fromSectionDto = (dto: SectionDto): Section => {
        return {
            id: '',
            name: dto.name,
            priority: dto.priority
        };
    }
}