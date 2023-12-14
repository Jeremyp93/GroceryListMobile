import { ElementRef } from '@angular/core';
import { OnlyNumbersDirective } from './only-numbers.directive';

describe('OnlyNumbersDirective', () => {
  it('should create an instance', () => {
    const directive = new OnlyNumbersDirective(new ElementRef(null));
    expect(directive).toBeTruthy();
  });
});
