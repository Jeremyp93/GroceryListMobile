import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { v4 as UUID } from 'uuid';

import { StoreService } from "../store.service";
import { Store } from "../types/store.type";
import { AddSection, AddStore, DeleteSection, DeleteStore, DropSection, GetSelectedStore, GetStores, SaveSections, SetSelectedStore, UpdateStore } from "./store.actions";
import { Section } from "../types/section.type";

export interface StoreStateModel {
    stores: Store[];
    selectedStore: Store | null;
    lastUpdatedStore: Store | null;
}

@State<StoreStateModel>({
    name: 'stores',
    defaults: {
        stores: [],
        selectedStore: null,
        lastUpdatedStore: null
    }
})
@Injectable()
export class StoreState {
    storeService = inject(StoreService);

    @Selector()
    static getStores(state: StoreStateModel) {
        return state.stores;
    }

    @Selector()
    static getSelectedStore(state: StoreStateModel) {
        return state.selectedStore;
    }

    @Selector()
    static getLastUpdatedStore(state: StoreStateModel) {
        return state.lastUpdatedStore;
    }

    @Selector()
    static getSections(state: StoreStateModel): Section[] {
        return state.selectedStore?.sections.sort((a, b) => a.priority - b.priority) ?? [];
    }

    @Action(GetStores)
    getStores({ getState, setState }: StateContext<StoreStateModel>) {
        return this.storeService.getAllStores().pipe(
            tap((result) => {
                const state = getState();
                setState({
                    ...state,
                    stores: result,
                });
            })
        );
    }

    @Action(DeleteStore)
    deleteStore({ getState, setState }: StateContext<StoreStateModel>, { id }: DeleteStore) {
        return this.storeService.deleteStore(id).pipe(
            tap(() => {
                const state = getState();
                const filteredArray = state.stores.filter(item => item.id !== id);
                setState({
                    ...state,
                    stores: filteredArray,
                });
            })
        );
    }

    @Action(SetSelectedStore)
    setSelectedStore({ getState, setState, dispatch }: StateContext<StoreStateModel>, { payload }: SetSelectedStore) {
        const state = getState();
        if (payload) {
            const sections = [...payload?.sections];
            const sectionWithIds = sections.map(i => ({ ...i, id: UUID() }));
            payload.sections = sectionWithIds;
        }
        setState({
            ...state,
            selectedStore: payload
        });
    }

    @Action(AddStore)
    addStore({ getState, patchState }: StateContext<StoreStateModel>, { payload }: AddStore) {
        return this.storeService.addStore(payload).pipe(
            tap((result) => {
                const state = getState();
                patchState({
                    stores: [...state.stores, result]
                });
            })
        );
    }

    @Action(GetSelectedStore)
    getSelectedStore({ getState, setState }: StateContext<StoreStateModel>, { id }: GetSelectedStore) {
        return this.storeService.getStoreById(id).pipe(
            tap((result) => {
                const state = getState();
                const sections = [...result.sections];
                const sectionWithIds = sections.map(i => ({ ...i, id: UUID() }));
                result.sections = sectionWithIds;
                setState({
                    ...state,
                    selectedStore: result
                });
            })
        );
    }

    @Action(UpdateStore)
    updateStore({ getState, setState }: StateContext<StoreStateModel>, { payload, id }: UpdateStore) {
        return this.storeService.updateStore(id, payload).pipe(
            tap((result) => {
                const state = getState();
                const stores = [...state.stores];
                const updatedStoreIndex = stores.findIndex(item => item.id === id);
                stores[updatedStoreIndex] = result;
                setState({
                    ...state,
                    stores: stores,
                    lastUpdatedStore: result
                });
            })
        );
    }

    @Action(DropSection)
    dropSection({ getState, patchState }: StateContext<StoreStateModel>, { prevIndex, currentIndex }: DropSection) {
        const state = getState();
        const selectedStore = {...state.selectedStore!};
        const sections = selectedStore.sections ?? [];
        const movedItem = sections.splice(prevIndex, 1)[0];
        sections.splice(currentIndex, 0, movedItem);
        movedItem.priority = currentIndex + 1;
        sections.forEach((section, index) => {
            section.priority = index + 1;
        });

        patchState({
            selectedStore: selectedStore
        });
    }

    @Action(SaveSections)
    saveSections({ getState, patchState }: StateContext<StoreStateModel>) {
        const state = getState();
        return this.storeService.updateSections(state.selectedStore?.id!, state.selectedStore!.sections).pipe(
            tap((result) => {
                patchState({
                    selectedStore: {...state.selectedStore!, sections: result.map(i => ({ ...i, id: UUID() }))}
                });
            })
        );
    }

    @Action(DeleteSection)
    deleteSection({ getState, setState }: StateContext<StoreStateModel>, { id }: DeleteSection) {
        const state = getState();
        const selectedStore = { ...state.selectedStore! };
        const sections = [...selectedStore.sections];

        const sectionToDelete = sections.find(s => s.id === id);
        if (sectionToDelete) {
            const priorityToDelete = sectionToDelete.priority;

            const updatedSections = sections.filter(s => s.id !== id).map(s => {
                if (s.priority > priorityToDelete) {
                    return { ...s, priority: s.priority - 1 };
                }
                return s;
            });

            selectedStore.sections = updatedSections;
            setState({
                ...state,
                selectedStore: selectedStore,
            });
        }
    }

    @Action(AddSection)
    addSection({ getState, patchState }: StateContext<StoreStateModel>, { payload }: AddSection) {
        const state = getState();
        const selectedStore = { ...state.selectedStore! };
        const sections = [...selectedStore.sections];
        const highestPriority = sections.reduce((maxPriority, obj) => {
            return obj.priority > maxPriority ? obj.priority : maxPriority;
        }, -Infinity);
        sections.push({ ...payload, id: UUID(), priority: highestPriority+1 });
        selectedStore.sections = sections;
        patchState({
            selectedStore: selectedStore
        });
    }
}