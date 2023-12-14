import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Alert, AlertType } from './alert.model';
import { AlertService } from './alert.service';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit, OnDestroy {
  alertService = inject(AlertService);
  cd= inject(ChangeDetectorRef)
  alert!: Alert;
  showAlert: boolean = false;
  alertServiceSubscription!: Subscription;

  ngOnInit(): void {
    this.alertServiceSubscription = this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
      if (alert.type !== AlertType.NoAlert) {
        this.showAlert = true;
        setTimeout(() => {this.showAlert = false; this.cd.detectChanges();}, 5000)
        return;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.alertServiceSubscription) {
      this.alertServiceSubscription.unsubscribe();
    }
  }
  
}
