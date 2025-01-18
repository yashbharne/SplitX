import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonItem,
  IonBackButton,
  IonList,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupExpenseService } from '../services/groupExpenseService/group-expense.service';
import { addIcons } from 'ionicons';
import {
  arrowForwardCircleOutline,
  personCircleOutline,
  trashBin,
  trashBinOutline,
  walletOutline,
} from 'ionicons/icons';
import { ToastService } from '../services/toastService/toast.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
  standalone: true,
  imports: [
    IonButton,

    IonAvatar,
    IonIcon,

    IonLabel,
    IonList,
    IonBackButton,
    IonItem,
    IonButtons,
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class ExpensePage implements OnInit {
  constructor(
    private routes: ActivatedRoute,
    private groupExpense: GroupExpenseService,
    private toast: ToastService,
    private router: Router
  ) {
    this.expenseDate = new Date(
      this.expenseData.createdAt
    ).toLocaleDateString();
    console.log(this.expenseData);
  }
  ngOnInit() {
    addIcons({
      arrowForwardCircleOutline,
      personCircleOutline,
      walletOutline,
      trashBin,
    });
    this.routes.params.subscribe((params) => {
      this.expenseId = params['expenseId'];
    });

    this.getExpense();
  }
  expenseId: string = '';
  expenseDate: string = '';
  expenseData: any = {};
  groupId: string = '';

  getExpense() {
    this.groupExpense.getExpense(this.expenseId).subscribe({
      next: (res) => {
        this.expenseData = res;
        this.groupId = res.groupId;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  onDeleteExpense() {
    this.groupExpense.deleteExpense(this.expenseId).subscribe({
      next: (res: any) => {
        this.toast.presentToastWithOptions({
          message: res.message,
          duration: 3000,
          color: 'success',
          position: 'bottom',
        });
        this.router.navigateByUrl('/dashboard/splitgroup/' + this.groupId);
      },
      error: (error) => {
        console.log(error);
        this.toast.presentToastWithOptions({
          message: error.error.message,
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
      },
    });
  }
}
