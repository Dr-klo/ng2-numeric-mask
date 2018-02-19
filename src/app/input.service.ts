import {InputManager} from "./input.manager";

interface DecimalSetting {
  addDecimal:boolean;
  decimalLength: number;
  deviderPos: number;
}
export class InputService {

  private inputManager: InputManager;
  private forceSliceCursor: number;
  private fixedDecimals: boolean;
  constructor(private htmlInputElement: any, private options: any) {
    this.inputManager = new InputManager(htmlInputElement);
  }

  get canInputMoreNumbers(): boolean {
    return this.inputManager.canInputMoreNumbers;
  }

  get inputSelection(): any {
    return this.inputManager.inputSelection;
  }

  get rawValue(): string {
    return this.inputManager.rawValue;
  }

  set rawValue(value: string) {
    this.inputManager.rawValue = value;
  }

  get storedRawValue(): string {
    return this.inputManager.storedRawValue;
  }

  get value(): number {
    return this.clearMask(this.rawValue);
  }

  set value(value: number) {
    this.rawValue = this.applyMask(true, "" + value);
  }

  addNumber(keyCode: number): void {
    if (!this.rawValue) {
      this.rawValue = this.applyMask(false, "0");
    }

    let keyChar = String.fromCharCode(keyCode);
    let selectionStart = this.inputSelection.selectionStart;
    let selectionEnd = this.inputSelection.selectionEnd;
    this.rawValue = this.rawValue.substring(0, selectionStart) + keyChar +
      this.rawValue.substring(selectionEnd, this.rawValue.length);
    this.updateFieldValue(selectionStart + 1);
  }
  getDecimal(numbers: string, setting: DecimalSetting): string {
  // console.log("getDec", numbers);
    let decimalPart = numbers;
    this.fixedDecimals = decimalPart.length >= this.options.maxPrecision; // indicates that decimals placeholder is fixed now
    if (decimalPart.length > this.options.maxPrecision) {
      console.log("cut decimals");
      decimalPart = decimalPart.slice(0, this.options.maxPrecision);
    }
    if (!this.options.cropDecimal) {
      while (decimalPart.length < this.options.maxPrecision) {
        decimalPart += "0";
        this.forceSliceCursor--;
      }
    }
    if (setting.deviderPos < 0 && setting.addDecimal) {
      // console.log("fix firstly decimal position")
      this.forceSliceCursor -= this.options.decimal.length + this.options.suffix.length;
    }
    // console.log("decimal:", decimalPart, setting);
    return decimalPart;
  }
  getInteger(numbers: string, setting: DecimalSetting): string {
    let integerPart = numbers
      .replace(/^0*/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, this.options.thousands);

    if (integerPart === "") {
      integerPart = "0";
    }
    // console.log("integer ", integerPart);
    return integerPart;
  }
  getDecimalSetting(value: string): DecimalSetting {
    let decimalLength = 0;
    const devider = value.indexOf(this.options.decimal);
    let addDecimal = false || !this.options.cropDecimal;
    if (devider >= 0) {
      decimalLength = value.length - (devider + 1);
      addDecimal = true;
      if (decimalLength > this.options.maxPrecision) {
        decimalLength = this.options.maxPrecision;
      }
    }
    return {addDecimal, decimalLength, deviderPos: devider};
  }
  correctionDecimalInput(raw: string, cursor: number) {
    // console.log("check decimal input, devider position:" + raw.indexOf(this.options.decimal) + " cursor:" + cursor)
    if (raw.indexOf(this.options.decimal) >= 0 && raw.indexOf(this.options.decimal) < cursor) {
      // console.log("move cursor to right");
       this.forceSliceCursor++;
    }
    // user input decimal devider;
    if (raw[cursor] === this.options.decimal) {
      // this.forceSliceCursor++;
    }
  }
  formatRawValue(value: string, inputNumber:boolean): any {
    let rawValue: string;
    if (!this.options.allowNull && (value === null || value === "null" || value.length === 0)){
      rawValue = "0";
    }
    if (this.options.suffix) {
      // remove suffix for prevent crash of decimal processing.
      value = value.replace(this.options.suffix, "");
    }
    rawValue = inputNumber ? Number.parseFloat(new Number(value).toFixed( this.options.maxPrecision)).toString() : value;

    const setting = this.getDecimalSetting(rawValue);

    let integer = rawValue.slice(0, setting.deviderPos > 0 ? setting.deviderPos : rawValue.length);
    let decimal = rawValue.slice(integer.length);

    // console.log("formating I: >" + integer + "< dec > " + decimal + "<");
    if (integer) {
      integer = integer.replace(/[^0-9]/g, "");
    }
    if (decimal) {
      decimal = decimal.replace(/[^0-9]/g, "");
    }
    const result = {rawValue, integer, decimal};
    // console.log("formated:", result);
    return result;
  }

  applyMask(isNumber: boolean, rawValue: string, selectionStart: number = null): string {
    // console.log("raw is " + rawValue);
    this.forceSliceCursor = 0
    let isIntegerInput = false;
    const {allowNegative, decimal, prefix, suffix} = this.options;
    const formatted = this.formatRawValue(rawValue, isNumber);
    const setting = this.getDecimalSetting(rawValue);
    const integerPart =  this.getInteger(formatted.integer, setting);

    if (selectionStart && setting.deviderPos < selectionStart) {
      isIntegerInput = true;
    }

    let newRawValue = integerPart;
    const decimalPart =  this.getDecimal(formatted.decimal, setting);
    if (setting.addDecimal) {
      newRawValue += decimal + decimalPart;
    }
    if (this.fixedDecimals) {
      this.correctionDecimalInput(rawValue, selectionStart);
    }
    const isZero = parseInt(integerPart) === 0 && (parseInt(decimalPart) === 0 || decimalPart === "");
    const operator = (rawValue.indexOf("-") > -1 && allowNegative && !isZero) ? "-" : "";
    return operator + prefix + newRawValue + suffix;
  }

  clearMask(rawValue: string): number {
    if (rawValue == null) {
      return null;
    }

    let value = rawValue.replace(this.options.prefix, "").replace(this.options.suffix, "");

    if (this.options.thousands) {
      value = value.replace(new RegExp("\\" + this.options.thousands, "g"), "");
    }

    if (this.options.decimal) {
      value = value.replace(this.options.decimal, ".");
    }

    return parseFloat(value);
  }

  changeToNegative(): void {
    if (this.options.allowNegative && this.rawValue != "" && this.rawValue.charAt(0) != "-" && this.value != 0) {
      this.rawValue = "-" + this.rawValue;
    }
  }

  changeToPositive(): void {
    this.rawValue = this.rawValue.replace("-", "");
  }

  removeNumber(keyCode: number): void {
    let selectionEnd = this.inputSelection.selectionEnd;
    let selectionStart = this.inputSelection.selectionStart;

    if (selectionStart > this.rawValue.length - this.options.suffix.length) {
      selectionEnd = this.rawValue.length - this.options.suffix.length;
      selectionStart = this.rawValue.length - this.options.suffix.length;
    }

    selectionEnd = keyCode == 46 || keyCode == 63272 ? selectionEnd + 1 : selectionEnd;
    selectionStart = keyCode == 8 ? selectionStart - 1 : selectionStart;
    this.rawValue = this.rawValue.substring(0, selectionStart) + this.rawValue.substring(selectionEnd, this.rawValue.length);
    this.updateFieldValue(selectionStart);
  }

  updateFieldValue(selectionStart?: number): void {
    let newRawValue = this.applyMask(false, this.rawValue || "" , selectionStart);
    selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
    // todo this method set up cursor position
    // console.log("cursor set" + selectionStart + " slice " + this.forceSliceCursor)
    this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart, this.forceSliceCursor);
  }

  updateOptions(options: any): void {
    let value: number = this.value;
    this.options = options;
    this.value = value;
  }

  isReadOnly() {
    return this.inputManager.isReadOnly();
  }
}
