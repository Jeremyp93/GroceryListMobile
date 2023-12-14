import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { LoadingSize } from '../loading/loading-size.enum';
import { ButtonStyle } from './button-style.enum';
import { ButtonStyleDirective } from './button-style.directive';
import { ButtonHover } from './button-hover.enum';
import { ButtonHoverDirective } from './button-hover.directive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ButtonStyleDirective, ButtonHoverDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() buttonStyle: ButtonStyle = ButtonStyle.normal;
  @Input() buttonHover: ButtonHover = ButtonHover.up;
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  loadingSize = LoadingSize.small;
}
