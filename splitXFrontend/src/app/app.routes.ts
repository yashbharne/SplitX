import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './userDashboard/dashboard-layout/dashboard-layout.component';
import { authGuard } from './Guards/auth.guard';
import { checkLoginGuard } from './Guards/check-login.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [checkLoginGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [checkLoginGuard],
    loadComponent: () =>
      import('./authPages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-up',
    canActivate: [checkLoginGuard],
    loadComponent: () =>
      import('./authPages/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],

    children: [
      {
        path: 'group',
        // router.navigateByUrl
        loadComponent: () =>
          import('./userDashboard/group/group.page').then((m) => m.GroupPage),
      },
      {
        path: 'friends',
        loadComponent: () =>
          import('./userDashboard/friends/friends.page').then(
            (m) => m.FriendsPage
          ),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./userDashboard/activity/activity.page').then(
            (m) => m.ActivityPage
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./userDashboard/account/account.page').then(
            (m) => m.AccountPage
          ),
      },
      {
        path: 'splitgroup/:groupId',
        loadComponent: () =>
          import('./userDashboard/splitgroup/splitgroup.page').then(
            (m) => m.SplitgroupPage
          ),
      },
    ],
  },
  {
    path: 'create-group',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./userDashboard/create-group/create-group.page').then(
        (m) => m.CreateGroupPage
      ),
  },
  {
    path: 'add-expense/:groupId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./groupExpensePages/add-expense/add-expense.page').then(
        (m) => m.AddExpensePage
      ),
  },
  {
    path: 'expense/:expenseId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./expense/expense.page').then((m) => m.ExpensePage),
  },
  {
    path: 'group-setting/:groupId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./groupSettingPage/group-setting/group-setting.page').then(
        (m) => m.GroupSettingPage
      ),
  },
  {
    path: 'group-balance/:groupId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./group-balance/group-balance.page').then(
        (m) => m.GroupBalancePage
      ),
  },
  {
    path: 'add-friends/:groupId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./add-friends/add-friends.page').then((m) => m.AddFriendsPage),
  },
];
