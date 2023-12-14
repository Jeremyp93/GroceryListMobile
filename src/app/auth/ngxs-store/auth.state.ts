import { Injectable, inject } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { JwtHelperService } from '@auth0/angular-jwt';

import { Login, Logout, Register } from "./auth.actions";
import { AuthService } from "../auth.service";
import { TokenResponseDto } from "../dtos/token-response-dto.type";

export interface AuthStateModel {
    token: string | null;
    username: string | null;
    name: string | null
}

@State<AuthStateModel>({
    name: 'auth',
    defaults: {
        token: null,
        username: null,
        name: null
    }
})

@Injectable()
export class AuthState {
    jwtHelper = inject(JwtHelperService);

    @Selector()
    static token(state: AuthStateModel): string | null {
        return state.token;
    }

    @Selector()
    static getName(state: AuthStateModel): string | null {
        return state.name;
    }

    @Selector()
    static isAuthenticated(state: AuthStateModel): boolean {
        return !!state.token;
    }

    constructor(private authService: AuthService) { }

    @Action(Login)
    login(ctx: StateContext<AuthStateModel>, action: Login) {
        return this.authService.login(action.payload).pipe(
            tap((result: TokenResponseDto) => {
                const tokenDecoded = this.jwtHelper.decodeToken(result.token);
                ctx.patchState({
                    token: result.token,
                    username: action.payload.username,
                    name: tokenDecoded.name
                });
            })
        );
    }

    @Action(Register)
    register(_: StateContext<AuthStateModel>, action: Register) {
        return this.authService.register(action.payload);
    }

    @Action(Logout)
    logout(ctx: StateContext<AuthStateModel>) {
        ctx.setState({
            token: null,
            username: null,
            name: null
        });
    }
}