import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceryListNewComponent } from './grocery-list-new.component';
import { NgxsModule } from '@ngxs/store';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroceryListNewComponent', () => {
  let component: GroceryListNewComponent;
  let fixture: ComponentFixture<GroceryListNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListNewComponent, NgxsModule.forRoot(), RouterTestingModule],
      providers: [ HttpClient, HttpHandler ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroceryListNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
