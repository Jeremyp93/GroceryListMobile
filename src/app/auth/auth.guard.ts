import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { JwtHelperService } from '@auth0/angular-jwt';

import { Store } from "@ngxs/store";
import { AuthState } from "./ngxs-store/auth.state";
import { Logout } from "./ngxs-store/auth.actions";

export const authGuard: CanActivateFn = () => {
    const store = inject(Store);
    const jwtHelper = inject(JwtHelperService);

    const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
    const token = store.selectSnapshot(AuthState.token);

    if (!isAuthenticated || jwtHelper.isTokenExpired(token)) {
        store.dispatch(new Logout());
        return false;
    }

    return true;
};