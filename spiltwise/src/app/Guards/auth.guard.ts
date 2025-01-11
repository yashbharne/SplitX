import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accessToken = localStorage.getItem('access-token');

  if (accessToken) {
    console.log('if');
    router.navigateByUrl('/dashboard/group'); // Redirect if authenticated
    return false; // Block activation of the current route
  }

  // console.log('else');
  // router.navigateByUrl('/dashboard/group'); // Redirect to home if not authenticated
  return true;
};
