import { Routes } from "@angular/router";

import { authGuard } from "../auth/auth.guard";
import { ROUTES_PARAM } from "../constants";
import { canDeactivateFormComponent } from "../guards/pending-changes-guard.service";
import { validIdGuard } from "../guards/validId-guard.service";
import { GroceryListDetailsComponent } from "./grocery-list-details/grocery-list-details.component";
import { GroceryListItemsComponent } from "./grocery-list-items/grocery-list-items.component";
import { GroceryListNewComponent } from "./grocery-list-items/grocery-list-new/grocery-list-new.component";
import { GroceryListComponent } from "./grocery-list.component";

export const GROCERY_LIST_ROUTES: Routes = [
    {
        path: '', component: GroceryListComponent, canActivate: [authGuard], canActivateChild: [authGuard], title: 'Grocery List - Lists', children: [
            { path: '', component: GroceryListItemsComponent, pathMatch: 'full' },
            { path: ROUTES_PARAM.GROCERY_LIST.NEW, component: GroceryListNewComponent, title: 'Grocery List - Create' },
            { path: `:${ROUTES_PARAM.ID_PARAMETER}`, component: GroceryListDetailsComponent, canActivate: [validIdGuard], title: 'Grocery List - List', canDeactivate: [canDeactivateFormComponent] },
            { path: `:${ROUTES_PARAM.ID_PARAMETER}/${ROUTES_PARAM.GROCERY_LIST.EDIT}`, component: GroceryListNewComponent, canActivate: [validIdGuard], title: 'Grocery List - Edit', },
        ]
    },
];