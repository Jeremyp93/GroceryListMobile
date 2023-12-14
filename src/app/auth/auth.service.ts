import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { Login as LoginType } from "./types/login.type";
import { Register as RegisterType } from "./types/register.type";
import { environment } from "../../environments/environment";
import { ROUTES_PARAM } from "../constants";
import { TokenResponseDto } from "./dtos/token-response-dto.type";

@Injectable({ providedIn: 'root' })
export class AuthService {
    httpClient = inject(HttpClient);

    login = (login: LoginType): Observable<TokenResponseDto> => {
        return this.httpClient.post<TokenResponseDto>(`${environment.userApiUrl}/${ROUTES_PARAM.AUTHENTICATION.LOGIN}`, { email: login.username, password: login.password });
    }

    register = (registerModel: RegisterType): Observable<void> => {
        return this.httpClient.post<void>(`${environment.userApiUrl}`, registerModel);
    }
}