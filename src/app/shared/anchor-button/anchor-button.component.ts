import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonHoverDirective } from '../button/button-hover.directive';
import { ButtonHover } from '../button/button-hover.enum';

@Component({
  selector: 'app-anchor-button',
  standalone: true,
  imports: [CommonModule, ButtonHoverDirective],
  templateUrl: './anchor-button.component.html',
  styleUrl: './anchor-button.component.scss'
})
export class AnchorButtonComponent {
  @Input() href: string = '';
  @Input() newWindow: boolean = false;
  @Input() anchorHover: ButtonHover = ButtonHover.up;
}
