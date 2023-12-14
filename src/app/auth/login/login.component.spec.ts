import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { NgxsModule } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';

import { Login, Logout } from '../ngxs-store/auth.actions';
import { LOGIN_FORM } from '../../constants';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NgxsModule.forRoot(), RouterTestingModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have username and password properties', () => {
    expect(component.loginFormUsername).toEqual('username');
    expect(component.loginFormPassword).toEqual('password');
  });

  it('should dispatch a Logout action when the user is already logged in', () => {
    spyOn(component.ngxsStore, 'selectSnapshot').and.returnValue(true);
    spyOn(component.ngxsStore, 'dispatch');

    component.ngOnInit();

    expect(component.ngxsStore.dispatch).toHaveBeenCalledWith(new Logout());
  });

  it('should initialize the login form on initialization', () => {
    expect(component.loginForm).toBeDefined();
  });

  it('should dispatch a Login action with the form values when the form is valid', () => {
    spyOn(component.ngxsStore, 'dispatch').and.returnValue(new Observable<void>);
    component.loginForm.controls[LOGIN_FORM.USERNAME].setValue('test@example.com');
    component.loginForm.controls[LOGIN_FORM.PASSWORD].setValue('password');

    component.onSubmit();

    expect(component.ngxsStore.dispatch).toHaveBeenCalledWith(new Login({ username: 'test@example.com', password: 'password' }));
  });

  it('should not dispatch a Login action and should not navigate when the form is submitted with invalid data', () => {
    spyOn(component.ngxsStore, 'dispatch');
    spyOn(component.router, 'navigate');
    component.loginForm.controls[LOGIN_FORM.USERNAME].setValue('test');
    component.loginForm.controls[LOGIN_FORM.PASSWORD].setValue('');

    component.onSubmit();

    expect(component.ngxsStore.dispatch).not.toHaveBeenCalled();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should display error messages when the form is submitted with invalid data', () => {
    component.loginForm.controls[LOGIN_FORM.USERNAME].setValue('test');
    component.loginForm.controls[LOGIN_FORM.PASSWORD].setValue('');

    component.onSubmit();

    expect(component.loginForm.controls[LOGIN_FORM.USERNAME].errors).toEqual({ email: true });
    expect(component.loginForm.controls[LOGIN_FORM.PASSWORD].errors).toEqual({ required: true});
  });

  it('should not reset the loading and submission states when the form is submitted with invalid data', () => {
    component.isLoading = true;
    component.isSubmitted = true;
    component.loginForm.controls[LOGIN_FORM.USERNAME].setValue('test');
    component.loginForm.controls[LOGIN_FORM.PASSWORD].setValue('');

    component.onSubmit();
    expect(component.isLoading).toBe(true);
    expect(component.isSubmitted).toBe(true);
  });
});
