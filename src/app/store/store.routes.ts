import { Routes } from "@angular/router";

import { authGuard } from "../auth/auth.guard";
import { ROUTES_PARAM } from "../constants";
import { canDeactivateFormComponent } from "../guards/pending-changes-guard.service";
import { validIdGuard } from "../guards/validId-guard.service";
import { StoreDetailComponent } from "./store-detail/store-detail.component";
import { StoreListComponent } from "./store-list/store-list.component";
import { StoreNewComponent } from "./store-list/store-new/store-new.component";
import { StoreComponent } from "./store.component";


export const STORE_ROUTES: Routes = [
    {
        path: '', component: StoreComponent, canActivate: [authGuard], canActivateChild: [authGuard], title: 'Stores', children: [
            { path: '', component: StoreListComponent, pathMatch: 'full' },
            { path: ROUTES_PARAM.STORE.NEW, component: StoreNewComponent, title: 'Store - Create' },
            { path: `:${ROUTES_PARAM.ID_PARAMETER}`, component: StoreDetailComponent, title: 'Store - Sections', canDeactivate: [canDeactivateFormComponent] },
            { path: `:${ROUTES_PARAM.ID_PARAMETER}/${ROUTES_PARAM.STORE.EDIT}`, component: StoreNewComponent, canActivate: [validIdGuard], title: 'Store - Edit', },
        ]
    }
];