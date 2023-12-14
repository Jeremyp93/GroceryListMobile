import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { NgxsModule } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';
import { ROUTES_PARAM } from '../../constants';
import { Register } from '../ngxs-store/auth.actions';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NgxsModule.forRoot(), RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all fields empty', () => {
    expect(component.signupForm.value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  });

  it('should submit form when all fields are filled correctly', () => {
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      confirmPassword: 'password'
    });
    spyOn(component.ngxsStore, 'dispatch').and.returnValue(of(null));
    spyOn(component.router, 'navigate');
    component.onSubmit();
    expect(component.ngxsStore.dispatch).toHaveBeenCalledWith(new Register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      confirmPassword: 'password'
    } as any));
    expect(component.router.navigate).toHaveBeenCalledWith([`/${ROUTES_PARAM.AUTHENTICATION.LOGIN}`]);
  });

  it('should not submit form when all fields are filled with invalid data', () => {
    component.signupForm.setValue({
      firstName: '',
      lastName: '',
      email: 'invalidemail',
      password: 'pass',
      confirmPassword: 'pass'
    });
    spyOn(component.ngxsStore, 'dispatch');
    spyOn(component.router, 'navigate');
    component.onSubmit();
    expect(component.isLoading).toBe(false);
    expect(component.isSubmitted).toBe(true);
    expect(component.ngxsStore.dispatch).not.toHaveBeenCalled();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should not submit form multiple times when all fields are filled with invalid data', () => {
    component.signupForm.setValue({
      firstName: '',
      lastName: '',
      email: 'invalidemail',
      password: 'pass',
      confirmPassword: 'pass'
    });
    spyOn(component.ngxsStore, 'dispatch');
    spyOn(component.router, 'navigate');
    component.onSubmit();
    component.onSubmit();
    component.onSubmit();
    expect(component.isLoading).toBe(false);
    expect(component.isSubmitted).toBe(true);
    expect(component.ngxsStore.dispatch).not.toHaveBeenCalled();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should handle server error when submitting form', () => {
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      confirmPassword: 'password'
    });
  
    spyOn(component.ngxsStore, 'dispatch').and.returnValue(throwError(() => new Error('error')));
    spyOn(component.router, 'navigate');
    component.onSubmit();
    expect(component.isLoading).toBe(false);
    expect(component.isSubmitted).toBe(false);
    expect(component.ngxsStore.dispatch).toHaveBeenCalled();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });
});
