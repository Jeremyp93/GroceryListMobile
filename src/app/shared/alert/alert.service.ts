import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { Alert, AlertType } from "./alert.model";

@Injectable({
    providedIn: 'root'
  })
  export class AlertService {
    private alertSubject: BehaviorSubject<Alert>;
    get alert$(): Observable<Alert> {
        return this.alertSubject.asObservable();
    }
  
    constructor() {
        const initialAlert: Alert = new Alert(AlertType.NoAlert);
        this.alertSubject = new BehaviorSubject<Alert>(initialAlert);
    }
  
    setAlertObs(alert: Alert) {
        this.alertSubject.next(alert);
    }
}