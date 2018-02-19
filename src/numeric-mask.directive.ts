import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnInit,
  Optional
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import {Numeric_Mask_Config, NumericMaskConfig} from "./numeric-mask.config";
import {InputHandler} from "./input.handler";

export const NumericMask_ValueAccessor: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumericMaskDirective),
  multi: true
};

@Directive({
  selector: "[numeric]",
  providers: [NumericMask_ValueAccessor]
})
export class NumericMaskDirective implements AfterViewInit, ControlValueAccessor, DoCheck, OnInit {

  @Input() options: any = {};

  inputHandler: InputHandler;
  keyValueDiffer: KeyValueDiffer<any, any>;

  optionsTemplate = {
    align: "left",
    allowNegative: true,
    allowNull: false,
    decimal: ".",
    maxPrecision: 2,
    prefix: "",
    suffix: "",
    cropDecimal: true,
    thousands: ","
  };

  constructor(@Optional() @Inject(Numeric_Mask_Config) private numericMaskConfig: NumericMaskConfig,
              private elementRef: ElementRef,
              private keyValueDiffers: KeyValueDiffers) {
    if (numericMaskConfig) {
      this.optionsTemplate = numericMaskConfig;
    }

    this.keyValueDiffer = keyValueDiffers.find({}).create();
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.style.textAlign = this.options.align ?
      this.options.align : this.optionsTemplate.align;
  }

  ngDoCheck() {
    if (this.keyValueDiffer.diff(this.options)) {
      this.elementRef.nativeElement.style.textAlign = this.options.align ?
        this.options.align : this.optionsTemplate.align;
      this.inputHandler.updateOptions((<any>Object).assign({}, this.optionsTemplate, this.options));
    }
  }

  ngOnInit() {
    this.inputHandler = new InputHandler(this.elementRef.nativeElement,
      (<any>Object).assign({}, this.optionsTemplate, this.options));
  }

  @HostListener("blur", ["$event"])
  handleBlur(event: any) {
    this.inputHandler.getOnModelTouched().apply(event);
  }
  @HostListener("focus", ["$event"])
  handleFocus(event: any) {
  this.elementRef.nativeElement.select();
  }

  @HostListener("cut", ["$event"])
  handleCut(event: any) {
    if (!this.isChromeAndroid()) {
      this.inputHandler.handleCut(event);
    }
  }

  @HostListener("input", ["$event"])
  handleInput(event: any) {
    if (this.isChromeAndroid()) {
      this.inputHandler.handleInput(event);
    }
  }

  @HostListener("keydown", ["$event"])
  handleKeydown(event: any) {
    if (!this.isChromeAndroid()) {
      this.inputHandler.handleKeydown(event);
    }
  }

  @HostListener("keypress", ["$event"])
  handleKeypress(event: any) {
    if (!this.isChromeAndroid()) {
      this.inputHandler.handleKeypress(event);
    }
  }

  @HostListener("paste", ["$event"])
  handlePaste(event: any) {
    if (!this.isChromeAndroid()) {
      this.inputHandler.handlePaste(event);
    }
  }

  isChromeAndroid(): boolean {
    return /chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);
  }

  registerOnChange(callbackFunction: Function): void {
    this.inputHandler.setOnModelChange(callbackFunction);
  }

  registerOnTouched(callbackFunction: Function): void {
    this.inputHandler.setOnModelTouched(callbackFunction);
  }

  setDisabledState(value: boolean): void {
    this.elementRef.nativeElement.disabled = value;
  }

  writeValue(value: number): void {
    this.inputHandler.setValue(value);
  }
}
