import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupSettingPage } from './group-setting.page';

describe('GroupSettingPage', () => {
  let component: GroupSettingPage;
  let fixture: ComponentFixture<GroupSettingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
