import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceryListComponent } from './grocery-list.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroceryListComponent', () => {
  let component: GroceryListComponent;
  let fixture: ComponentFixture<GroceryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListComponent, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroceryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
