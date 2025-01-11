import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupBalancePage } from './group-balance.page';

describe('GroupBalancePage', () => {
  let component: GroupBalancePage;
  let fixture: ComponentFixture<GroupBalancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupBalancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
