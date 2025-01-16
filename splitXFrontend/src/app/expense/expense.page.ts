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
import { ActivatedRoute } from '@angular/router';
import { GroupExpenseService } from '../services/group-expense.service';
import { addIcons } from 'ionicons';
import {
  arrowForwardCircleOutline,
  personCircleOutline,
  trashBin,
  trashBinOutline,
  walletOutline,
} from 'ionicons/icons';

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
    private groupExpense: GroupExpenseService
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

  getExpense() {
    this.groupExpense.getExpense(this.expenseId).subscribe({
      next: (res) => {
        this.expenseData = res;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  onDeleteExpense() {
    this.groupExpense.deleteExpense(this.expenseId).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
