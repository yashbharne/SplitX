import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const check = localStorage.getItem('access-token');
  const router = inject(Router);
  if (check != null) {
    return true; // Grant access
  } else {
    router.navigateByUrl('/login'); // Redirect to login
    return false; // Deny access
  }
};
