import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: 'input[onlyNumbers]',
  standalone: true
})
export class OnlyNumbersDirective {
  constructor(private elementRef: ElementRef) {}
  
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initalValue = this.elementRef.nativeElement.value;
    this.elementRef.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if ( initalValue !== this.elementRef.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
