import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  isAndroid(): boolean {
    return /android/i.test(navigator.userAgent);
  }

  isiPhone(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}