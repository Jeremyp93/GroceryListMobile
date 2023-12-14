import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Router, RouterModule } from '@angular/router';

import { Login, Logout } from '../ngxs-store/auth.actions';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { LOGIN_FORM, ROUTES_PARAM } from '../../constants';
import { AuthState } from '../ngxs-store/auth.state';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { InputType } from '../../shared/input-field/input-type.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, ButtonComponent, RouterModule, InputFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  ngxsStore = inject(Store);
  router = inject(Router);
  readonly registerRoute: string = '/' + ROUTES_PARAM.AUTHENTICATION.REGISTER;
  readonly loginFormUsername: string = LOGIN_FORM.USERNAME;
  readonly loginFormPassword: string = LOGIN_FORM.PASSWORD;
  loginForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  get inputTypes(): typeof InputType {
    return InputType;
  }

  ngOnInit(): void {
    const isLoggedIn = this.ngxsStore.selectSnapshot(AuthState.isAuthenticated);
    if (isLoggedIn) {
      this.ngxsStore.dispatch(new Logout());
    }
    this.#initForm();
  }

  onSubmit = () => {
    this.isSubmitted = true;
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.ngxsStore.dispatch(new Login(this.loginForm.value)).subscribe({
      next: () => {
        this.isLoading = this.isSubmitted = false;
        this.router.navigate([`/${ROUTES_PARAM.GROCERY_LIST.GROCERY_LIST}`]);
      },
      error: () => {
        this.isLoading = this.isSubmitted = false;
      }
    });
  }

  #initForm = () => {
    this.loginForm = new FormGroup({
      [LOGIN_FORM.USERNAME]: new FormControl('', [Validators.required, Validators.email]),
      [LOGIN_FORM.PASSWORD]: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }
}
