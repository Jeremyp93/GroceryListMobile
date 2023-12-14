import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { Login } from './types/login.type';
import { Register } from './types/register.type';
import { environment } from '../../environments/environment';
import { TokenResponseDto } from './dtos/token-response-dto.type';
import { ROUTES_PARAM } from '../constants';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verifies that there are no outstanding requests
  });

  it('should make a POST request for login', () => {
    const mockLogin: Login = { username: 'test@example.com', password: 'password123' };
    const mockTokenResponse: TokenResponseDto = { token: 'mockToken' };

    authService.login(mockLogin).subscribe((response) => {
      expect(response).toEqual(mockTokenResponse);
    });

    const req = httpTestingController.expectOne(`${environment.userApiUrl}/${ROUTES_PARAM.AUTHENTICATION.LOGIN}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: mockLogin.username, password: mockLogin.password });

    req.flush(mockTokenResponse);
  });

  it('should make a POST request for registration', () => {
    const mockRegister: Register = { firstName: 'John', lastName: 'Doe', email: 'example@test.ca', password: 'password' };

    authService.register(mockRegister).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${environment.userApiUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegister);

    req.flush(null);
  });
});
