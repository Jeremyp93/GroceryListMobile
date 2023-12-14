import { Routes } from '@angular/router';

import { ROUTES_PARAM } from './constants';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST, pathMatch: 'full' },
    {
        path: ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST,
        loadChildren: () => import('./grocery-list/grocery-list.routes').then(m => m.GROCERY_LIST_ROUTES),
    },
    {
        path: ROUTES_PARAM.STORE.STORE,
        loadChildren: () => import('./store/store.routes').then(m => m.STORE_ROUTES),
    },
    {
        path: ROUTES_PARAM.AUTHENTICATION.LOGIN, component: LoginComponent, title: 'Grocery List - Login'
    },
    {
        path: ROUTES_PARAM.AUTHENTICATION.REGISTER, component: RegisterComponent, title: 'Grocery List - Register'
    },
    { path: '**', redirectTo: ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST }
];
