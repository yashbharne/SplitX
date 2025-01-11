import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitgroupPage } from './splitgroup.page';

describe('SplitgroupPage', () => {
  let component: SplitgroupPage;
  let fixture: ComponentFixture<SplitgroupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitgroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
