import { Pipe, PipeTransform, inject } from '@angular/core';

import { Store } from '../../store/types/store.type';
import { GOOGLE_MAPS_QUERY, GOOGLE_MAPS_QUERY_ANDROID, MAPS_QUERY_IPHONE } from '../../constants';
import { DeviceService } from '../../shared/device.service';

@Pipe({
    name: 'linkMapsStore',
    standalone: true,
})
export class LinkMapsStorePipe implements PipeTransform {
    deviceService = inject(DeviceService);
    transform(store: Store): string | undefined {
        if (!store) return;

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            if (this.deviceService.isAndroid()) {
                return `${GOOGLE_MAPS_QUERY_ANDROID}${store.street},${store.city},${store.zipCode},${store.country}`;
            } else {
                return `${MAPS_QUERY_IPHONE}${store.street},${store.city},${store.zipCode},${store.country}`;
            }
        } else {
            return `${GOOGLE_MAPS_QUERY}${store.street},${store.city},${store.zipCode},${store.country}`;
        }
    }
}