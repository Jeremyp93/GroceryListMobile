import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

import { routes } from './app.routes';
import { GroceryListState } from './grocery-list/ngxs-store/grocery-list.state';
import { IngredientState } from './grocery-list/ngxs-store/ingredient.state';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthState } from './auth/ngxs-store/auth.state';
import { JwtModule } from '@auth0/angular-jwt';
import { authInterceptor } from './auth/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { StoreState } from './store/ngxs-store/store.state';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(NgxsModule.forRoot([GroceryListState, IngredientState, AuthState, StoreState]),
    NgxsStoragePluginModule.forRoot({ key: AuthState }),
    JwtModule.forRoot({
      config: {
        tokenGetter: undefined
      },
    }),
    NgxsLoggerPluginModule.forRoot({
      collapsed: false,
      disabled: environment.production
    })),
  ]
};

