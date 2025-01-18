import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loadingService/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoadingService);

  // Show the loader before making the request
  loaderService.showLoader();

  return next(req).pipe(
    // Ensure hideLoader is called when request completes or fails
    finalize(() => {
      loaderService.hideLoader();
    })
  );
};
