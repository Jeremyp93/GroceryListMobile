import { Directive, Input, HostBinding, HostListener } from '@angular/core';
import { ButtonHover } from './button-hover.enum';

@Directive({
    selector: '[appButtonHover]',
    standalone: true
})
export class ButtonHoverDirective {
    @Input('appButtonHover') hoverClass: ButtonHover = ButtonHover.none; // Input parameter to specify the CSS class

    @HostBinding('class')
    hostClass: string = ''; // CSS class binding for the host element

    @HostListener('mouseenter')
    onMouseEnter() {
        this.hostClass = this.hoverClass; // Apply the specified CSS class on hover
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hostClass = ''; // Remove the CSS class on mouse leave
    }
}