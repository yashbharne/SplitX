import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './userDashboard/dashboard-layout/dashboard-layout.component';
import { authGuard } from './Guards/auth.guard';
import { authenticationGuard } from './Guards/authentication.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./authPages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./authPages/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,

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
    loadComponent: () =>
      import('./userDashboard/create-group/create-group.page').then(
        (m) => m.CreateGroupPage
      ),
  },
  {
    path: 'add-expense/:groupId',
    loadComponent: () =>
      import('./groupExpensePages/add-expense/add-expense.page').then(
        (m) => m.AddExpensePage
      ),
  },
  {
    path: 'expense/:expenseId',
    loadComponent: () =>
      import('./expense/expense.page').then((m) => m.ExpensePage),
  },
  {
    path: 'group-setting/:groupId',
    loadComponent: () =>
      import('./groupSettingPage/group-setting/group-setting.page').then(
        (m) => m.GroupSettingPage
      ),
  },
];
