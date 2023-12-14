import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreNewComponent } from './store-new.component';
import { RouterTestingModule  } from '@angular/router/testing';
import { NgxsModule } from '@ngxs/store';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('StoreNewComponent', () => {
  let component: StoreNewComponent;
  let fixture: ComponentFixture<StoreNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreNewComponent, RouterTestingModule, NgxsModule.forRoot()],
      providers: [HttpClient, HttpHandler]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
