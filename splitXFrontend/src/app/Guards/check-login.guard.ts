import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const checkLoginGuard: CanActivateFn = (route, state) => {
  const loggedUser = localStorage.getItem('access-token');
  const router = inject(Router);
  if (loggedUser) {
    router.navigateByUrl('/dashboard/group'); // Redirect to profile
    return false; // Deny access
  }
  return true; // Grant access
};
