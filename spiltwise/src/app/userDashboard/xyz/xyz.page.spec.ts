import { ComponentFixture, TestBed } from '@angular/core/testing';
import { XYZPage } from './xyz.page';

describe('XYZPage', () => {
  let component: XYZPage;
  let fixture: ComponentFixture<XYZPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(XYZPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
