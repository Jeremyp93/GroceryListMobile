import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { AuthState } from './ngxs-store/auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const ngxsStore = inject(Store);

    if (req.url.endsWith('/api/users/login')) {
        return next(req);
    }
    if (req.url.endsWith('/api/users') && req.method === 'POST') {
        return next(req);
    }

    const authToken = ngxsStore.selectSnapshot(AuthState.token);

    const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });

    return next(authReq);
}