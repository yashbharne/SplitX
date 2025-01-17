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
import { GroupExpenseService } from 'src/app/services/groupExpenseService/group-expense.service';
import { GroupsService } from 'src/app/services/groupService/groups.service';
import { SendingReceivingDataService } from 'src/app/services/sendingReceivingDataService/sending-receiving-data.service';

interface GroupMember {
  _id: string;
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
  callFrom: string = '';
  expenseData: any = {};

  constructor(
    private router: Router,
    private routes: ActivatedRoute,
    private group: GroupsService,
    private groupExpense: GroupExpenseService,
    private sendingReceivingData: SendingReceivingDataService
  ) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {
    this.routes.params.subscribe((params) => {
      this.groupId = params['groupId'];
    });

    this.getAllMembers();
    this.clearData();

    this.expenseData = this.sendingReceivingData.getData();
    this.callFrom = this.sendingReceivingData.callFrom;
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
      this.sendingReceivingData.clearData();
      this.router.navigateByUrl(`/dashboard/splitgroup/${this.groupId}`);
    } else {
      this.currentView = 'main';
    }
  }

  getPaidByText(): string {
    if (this.isMultiplePayers) {
      return 'Multiple';
    }
    const payer = this.groupMembers.find((m) => m._id === this.selectedPayer);
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
            id: m._id,
            name: m.name,
            paidAmount: m.paidAmount,
          }))
      : [
          {
            id: this.selectedPayer,
            name:
              this.groupMembers.find((m) => m._id === this.selectedPayer)
                ?.name || 'Unknown',
            paidAmount: this.amount,
          },
        ];

    const participants = this.groupMembers
      .filter((m) => m.isSelected || this.splitType === 'unequal')
      .map((m) => ({
        memberId: m._id,
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
      expenseId: this.callFrom ? this.expenseData._id : '',
    };

    if (this.callFrom) {
      console.log('In Edit Expense');
      console.log('Expense Payload:', expensePayload);

      this.groupExpense.updateExpense(expensePayload).subscribe({
        next: (res: any) => {
          console.log(res);
          // Clear data after successful edit
          this.sendingReceivingData.clearData();
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.groupExpense.addExpense(expensePayload).subscribe({
        next: (res: any) => {
          console.log('Expense added successfully:', res);
          this.clearData(); // Clear data after successful add
          this.router.navigateByUrl(`/dashboard/splitgroup/${this.groupId}`);
        },
        error: (error) => {
          console.error('Error adding expense:', error);
        },
      });
    }
  }

  // Method to clear the data after successful API call
  clearData() {
    this.description = '';
    this.amount = null;
    this.splitType = '';
    this.isMultiplePayers = false;
    this.selectedPayer = '';
    this.groupMembers = [];
  }

  getAllMembers() {
    this.group.getAllMember({ groupId: this.groupId }).subscribe({
      next: (res: any) => {
        console.log(res);
        for (let index = 0; index < res.getMembers.length; index++) {
          this.groupMembers.push({
            _id: res.getMembers[index]._id,
            name: res.getMembers[index].name,
            paidAmount: 0,
            isSelected: true,
          });
          if (this.callFrom === 'editExpense' && this.expenseData) {
            this.fillEditData(this.expenseData);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  checkForEditing() {
    this.callFrom = this.sendingReceivingData.callFrom;
    if (this.callFrom === 'editExpense') {
    }
  }
  fillEditData(expense: any) {
    console.log('In FillEdit');

    this.description = expense.description;
    this.amount = expense.amount;
    this.splitType = expense.splitType;
    this.isMultiplePayers = expense.paidBy.length > 1;
    console.log(this.splitType);

    if (this.isMultiplePayers) {
      this.groupMembers = this.groupMembers.map((member) => {
        const payer = expense.paidBy.find((p: any) => p.id === member._id);
        return {
          ...member,
          paidAmount: payer ? payer.paidAmount : 0,
        };
      });
    } else if (expense.paidBy.length === 1) {
      this.selectedPayer = expense.paidBy[0].id;
    }

    if (this.splitType === 'equal') {
      console.log('In equal', this.groupMembers);

      this.groupMembers = this.groupMembers.map((member) => ({
        ...member,
        isSelected: expense.participants.some(
          (participant: any) => participant.memberId === member._id
        ),
      }));
      console.log(this.groupMembers);
    } else if (this.splitType === 'unequal') {
      console.log('In unequal');

      // Check if splitAmount exists and has the expected structure
      console.log('Split Amount:', expense.splitAmount);

      if (Array.isArray(expense.splitAmount)) {
        console.log('In array');
        console.log(this.groupMembers);

        this.groupMembers = this.groupMembers.map((member) => {
          console.log('member', member);

          const split = expense.splitAmount.find(
            (s: any) => s.memberId === member._id // Ensure member IDs match properly
          );
          console.log(split);

          return {
            ...member,
            splitAmount: split ? split.amount : 0, // Use split amount if found
          };
        });
      } else {
        console.error('Invalid splitAmount data:', expense.splitAmount);
      }

      console.log(this.groupMembers);
    }
  }
}
