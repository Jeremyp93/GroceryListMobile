import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputType } from './input-type.enum';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OnlyNumbersDirective } from './only-numbers.directive';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, OnlyNumbersDirective],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputFieldComponent,
      multi: true
    }
  ]
})
export class InputFieldComponent implements ControlValueAccessor {
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;
  @Input() type: InputType = InputType.text;
  @Input() label: string | null = null;
  @Input() id: string = '';
  @Input() placeHolder: string | null = null;
  value: string = '';

  onChange = (value: string) => {};

  onTouched = () => {};

  touched = false;

  disabled = false;

  get inputTypes(): typeof InputType {
    return InputType;
  }

  public focusInput() {
    if (this.inputField) {
      this.inputField.nativeElement.focus();
    }
  }

  onInputChange(event: Event) {
    this.#markAsTouched();
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  #markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
