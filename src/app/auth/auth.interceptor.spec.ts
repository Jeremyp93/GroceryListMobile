import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { NgxsModule, Store } from '@ngxs/store';
import { AuthState } from './ngxs-store/auth.state';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let controller: HttpTestingController;
  let mockSelect: jasmine.Spy;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(Store);
    mockSelect = spyOn(store, 'selectSnapshot');
  });

  it('should set the authToken', () => {
    mockSelect.withArgs(AuthState.token).and.returnValue('ThisIsTheToken');
    httpClient.get('/test').subscribe();
    const req = controller.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toEqual('Bearer ThisIsTheToken');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should not set the authToken when login', () => {
    httpClient.get('/api/users/login').subscribe();
    const req = controller.expectOne('/api/users/login');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should not set the authToken when register', () => {
    httpClient.post('/api/users', null).subscribe();
    const req = controller.expectOne('/api/users');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({}, { status: 200, statusText: 'OK' });
  });
});
