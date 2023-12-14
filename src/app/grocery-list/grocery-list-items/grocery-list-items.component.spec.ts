import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceryListItemsComponent } from './grocery-list-items.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule } from '@ngxs/store';

describe('GroceryListItemsComponent', () => {
  let component: GroceryListItemsComponent;
  let fixture: ComponentFixture<GroceryListItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListItemsComponent, RouterTestingModule, NgxsModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroceryListItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
