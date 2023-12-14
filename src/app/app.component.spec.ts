import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgxsModule } from '@ngxs/store';
import { AlertComponent } from './shared/alert/alert.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NgxsModule.forRoot()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
