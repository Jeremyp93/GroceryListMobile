import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';

import { AlertService } from '../shared/alert/alert.service';
import { Alert, AlertType } from '../shared/alert/alert.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    tap({error: (errorResponse: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occured.';
      if (Array.isArray(errorResponse.error)) {
        errorMessage = errorResponse.error[0];
      }
      alertService.setAlertObs(new Alert(AlertType.Error, errorMessage));
    }})
  );
}
