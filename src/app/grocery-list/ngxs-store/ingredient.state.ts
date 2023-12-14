import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { tap } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { v4 as UUID } from 'uuid';

import { Ingredient } from '../types/ingredient.type';
import { AddIngredient, DeleteIngredient, ResetIngredients, SaveIngredients, SelectIngredient, SetIngredients, SetSections } from './ingredient.actions';
import { GroceryListService } from '../grocery-list.service';
import { Section } from '../../store/types/section.type';
import { GroceryListState } from './grocery-list.state';
import { SetSelectedGroceryList } from './grocery-list.actions';
import { StoreState, StoreStateModel } from '../../store/ngxs-store/store.state';

export interface IngredientStateModel {
    ingredients: Ingredient[];
}

@State<IngredientStateModel>({
    name: 'ingredients',
    defaults: {
        ingredients: []
    },
})
@Injectable()
export class IngredientState {
    groceryListService = inject(GroceryListService);
    ngxsStore = inject(Store);

    @Selector([StoreState])
    static getIngredients(state: IngredientStateModel, storeState: StoreStateModel) {
        const sections = StoreState.getSections(storeState);
        return sortIngredientsByPriority(state.ingredients, sections);
    }

    @Action(SetIngredients)
    setIngredients({ getState, setState }: StateContext<IngredientStateModel>, { ingredients }: SetIngredients) {
        const state = getState();
        setState({
            ...state,
            ingredients: ingredients.map(i => ({ ...i, id: UUID() })),
        });
    }

    @Action(AddIngredient)
    addIngredient({ getState, patchState }: StateContext<IngredientStateModel>, { payload }: AddIngredient) {
        const state = getState();
        const ingredients = [...state.ingredients];
        ingredients.push({ ...payload, id: UUID() })
        patchState({
            ingredients: [...state.ingredients, payload]
        });
    }

    @Action(DeleteIngredient)
    deleteIngredient({ getState, setState }: StateContext<IngredientStateModel>, { id }: DeleteIngredient) {
        const state = getState();
        const filteredArray = state.ingredients.filter(item => item.id !== id);
        setState({
            ...state,
            ingredients: filteredArray,
        });
    }

    @Action(ResetIngredients)
    resetIngredients({ getState, setState }: StateContext<IngredientStateModel>, { }: ResetIngredients) {
        const state = getState();
        const resettedIngredients = [...state.ingredients].map(i => {
            return { ...i, selected: false }
        });
        setState({
            ...state,
            ingredients: resettedIngredients
        });
    }

    @Action(SelectIngredient)
    selectIngredient({ getState, setState }: StateContext<IngredientStateModel>, { id }: SelectIngredient) {
        const state = getState();
        const ingredients = [...state.ingredients];
        const selectedIngredientIndex = ingredients.findIndex(i => i.id === id);
        if (ingredients[selectedIngredientIndex].selected) return;
        const movedIngredient = ingredients.splice(selectedIngredientIndex, 1)[0];
        ingredients.push({ ...movedIngredient, selected: true });
        setState({
            ...state,
            ingredients: ingredients,
        });
    }

    @Action(SaveIngredients)
    saveIngredients({ getState, patchState, dispatch }: StateContext<IngredientStateModel>, { groceryListId }: SaveIngredients) {
        const state = getState();
        const selectedList = this.ngxsStore.selectSnapshot(GroceryListState.getSelectedGroceryList);
        return this.groceryListService.updateIngredients(groceryListId, [...state.ingredients]).pipe(tap((savedIngredients) => {
            /* patchState({
                ingredients: savedIngredients,
            }); */
            dispatch(new SetSelectedGroceryList({ ...selectedList!, ingredients: savedIngredients }));
        }));
    }
}

const sortIngredientsByPriority = (ingredients: Ingredient[], sections: Section[]): Ingredient[] => {
    if (sections.length === 0) {
        return ingredients;
    }

    // Separate selected and unselected ingredients
    const selectedIngredients = ingredients.filter(ingredient => ingredient.selected);
    const unselectedIngredients = ingredients.filter(ingredient => !ingredient.selected);

    unselectedIngredients.sort((a, b) => {
        const priorityA = getSectionPriority(a.category, sections);
        const priorityB = getSectionPriority(b.category, sections);

        if (priorityA === 0 && priorityB === 0) {
            return 0; // Maintain original order for both null categories
        } else if (priorityA === 0) {
            return 1; // Place items with null category at the end
        } else if (priorityB === 0) {
            return -1; // Place items with null category at the end
        }

        return priorityA - priorityB;
    });

    // Concatenate unselected ingredients and selected ingredients
    return unselectedIngredients.concat(selectedIngredients);
};

const getSectionPriority = (category: string | null, sections: Section[]): number => {
    const section = sections.find((s) => s.name === category);
    return section ? section.priority : 0;
}
