import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSegmentButton,
  IonButton,
  IonSelectOption,
  IonInput,
  IonSelect,
  IonSegment,
  IonList,
  IonCheckbox,
  IonAvatar,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonRadioGroup,
  IonRadio,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { GroupExpenseService } from 'src/app/services/group-expense.service';
import { GroupsService } from 'src/app/services/groups.service';

interface GroupMember {
  id: string;
  name: string;

  paidAmount?: number; // For "Paid by multiple"
  splitAmount?: number; // For "Unequal split"
  isSelected?: boolean;
}

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  standalone: true,
  imports: [
    IonNote,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonSegmentButton,
    IonButton,
    IonInput,
    IonSegment,
    IonList,
    IonCheckbox,

    IonIcon,
    IonBackButton,
    IonButtons,
    FormsModule,
    CommonModule,
    IonRadioGroup,
    IonRadio,
  ],
})
export class AddExpensePage implements OnInit {
  description: string = '';
  amount: number | null = null;
  splitType: string = '';
  currentView: 'main' | 'paidBy' | 'split' = 'main';
  isMultiplePayers: boolean = false;
  selectedPayer: string = '';

  groupMembers: GroupMember[] = [];
  groupId: string = '';

  constructor(
    private router: Router,
    private routes: ActivatedRoute,
    private group: GroupsService,
    private groupExpense: GroupExpenseService
  ) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {
    this.routes.params.subscribe((params) => {
      this.groupId = params['groupId'];
    });
    this.getAllMembers();
  }

  getTitle(): string {
    switch (this.currentView) {
      case 'paidBy':
        return 'Enter paid amounts';
      case 'split':
        return 'Adjust split';
      default:
        return 'Add Expense';
    }
  }

  showPaidByView() {
    this.currentView = 'paidBy';
  }

  showSplitView() {
    this.currentView = 'split';
  }

  goBack() {
    if (this.currentView === 'main') {
      this.router.navigateByUrl(`/dashboard/splitgroup/${this.groupId}`);
    } else {
      this.currentView = 'main';
    }
  }

  getPaidByText(): string {
    if (this.isMultiplePayers) {
      return 'Multiple';
    }
    const payer = this.groupMembers.find((m) => m.id === this.selectedPayer);
    return payer ? payer.name : '';
  }

  getAmountPerPerson(): number {
    if (!this.amount) return 0;
    const selectedCount = this.getSelectedCount();
    return selectedCount > 0 ? this.amount / selectedCount : 0;
  }

  getSelectedCount(): number {
    return this.groupMembers.filter((m) => m.isSelected).length;
  }

  confirmSelection() {
    this.currentView = 'main';
  }

  addExpense() {
    if (!this.amount && this.splitType !== 'unequal') {
      alert('Please enter a valid amount.');
      return;
    }

    const paidBy = this.isMultiplePayers
      ? this.groupMembers
          .filter((m) => m.paidAmount && m.paidAmount > 0)
          .map((m) => ({
            id: m.id,
            name: m.name,
            paidAmount: m.paidAmount,
          }))
      : [
          {
            id: this.selectedPayer,
            name:
              this.groupMembers.find((m) => m.id === this.selectedPayer)
                ?.name || 'Unknown',
            paidAmount: this.amount,
          },
        ];

    const participants = this.groupMembers
      .filter((m) => m.isSelected || this.splitType === 'unequal')
      .map((m) => ({
        memberId: m.id,
        name: m.name,
        amount:
          this.splitType === 'unequal' && m.splitAmount !== undefined
            ? m.splitAmount
            : 0,
      }));

    const expensePayload = {
      groupId: this.groupId,
      description: this.description,
      amount: this.amount,
      splitType: this.splitType,
      paidBy,
      participants,
    };

    console.log('Expense Payload:', expensePayload);

    this.groupExpense.addExpense(expensePayload).subscribe({
      next: (res: any) => {
        console.log('Expense added successfully:', res);
        this.router.navigateByUrl(`/dashboard/splitgroup/${this.groupId}`);
      },
      error: (error) => {
        console.error('Error adding expense:', error);
      },
    });
  }

  getAllMembers() {
    this.group.getAllMember({ groupId: this.groupId }).subscribe({
      next: (res: any) => {
        console.log(res);
        for (let index = 0; index < res.getMembers.length; index++) {
          this.groupMembers.push({
            id: res.getMembers[index]._id,
            name: res.getMembers[index].name,
            paidAmount: 0,
            isSelected: true,
          });
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
