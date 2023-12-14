import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreListComponent } from './store-list.component';
import { NgxsModule } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';

describe('StoreListComponent', () => {
  let component: StoreListComponent;
  let fixture: ComponentFixture<StoreListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreListComponent, NgxsModule.forRoot(), RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
