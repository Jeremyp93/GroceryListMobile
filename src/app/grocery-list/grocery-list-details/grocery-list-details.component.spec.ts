import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceryListDetailsComponent } from './grocery-list-details.component';
import { RouterTestingModule  } from '@angular/router/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';

describe('GroceryListDetailsComponent', () => {
  let component: GroceryListDetailsComponent;
  let fixture: ComponentFixture<GroceryListDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListDetailsComponent, RouterTestingModule, NgxsModule.forRoot()],
      providers: [ HttpClient, HttpHandler ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroceryListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
