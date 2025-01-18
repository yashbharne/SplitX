import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFriendsPage } from './add-friends.page';

describe('AddFriendsPage', () => {
  let component: AddFriendsPage;
  let fixture: ComponentFixture<AddFriendsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFriendsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
