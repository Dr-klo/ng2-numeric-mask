export class InputManager {

  constructor(private htmlInputElement: any) {
  }

  private _storedRawValue: string;

  get storedRawValue(): string {
    return this._storedRawValue;
  }

  get canInputMoreNumbers(): boolean {
    let haventReachedMaxLength = !(this.rawValue.length >= this.htmlInputElement.maxLength && this.htmlInputElement.maxLength >= 0);
    let selectionStart = this.inputSelection.selectionStart;
    let selectionEnd = this.inputSelection.selectionEnd;
    let haveNumberSelected = (selectionStart != selectionEnd && this.htmlInputElement.value.substring(selectionStart, selectionEnd).match(/\d/)) ? true : false;
    let startWithZero = (this.htmlInputElement.value.substring(0, 1) == "0");
    return haventReachedMaxLength || haveNumberSelected || startWithZero;
  }

  get inputSelection(): any {
    let selectionStart = 0;
    let selectionEnd = 0;

    if (typeof this.htmlInputElement.selectionStart == "number" && typeof this.htmlInputElement.selectionEnd == "number") {
      selectionStart = this.htmlInputElement.selectionStart;
      selectionEnd = this.htmlInputElement.selectionEnd;
    } else {
      let range = (<any>document).selection? (<any>document).selection.createRange() : null;

      if (range && range.parentElement() == this.htmlInputElement) {
        let lenght = this.htmlInputElement.value.length;
        let normalizedValue = this.htmlInputElement.value.replace(/\r\n/g, "\n");
        let startRange = this.htmlInputElement.createTextRange();
        startRange.moveToBookmark(range.getBookmark());
        let endRange = this.htmlInputElement.createTextRange();
        endRange.collapse(false);

        if (startRange.compareEndPoints("StartToEnd", endRange) > -1) {
          selectionStart = selectionEnd = lenght;
        } else {
          selectionStart = -startRange.moveStart("character", -lenght);
          selectionStart += normalizedValue.slice(0, selectionStart).split("\n").length - 1;

          if (startRange.compareEndPoints("EndToEnd", endRange) > -1) {
            selectionEnd = lenght;
          } else {
            selectionEnd = -startRange.moveEnd("character", -lenght);
            selectionEnd += normalizedValue.slice(0, selectionEnd).split("\n").length - 1;
          }
        }
      }
    }

    return {
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    };
  }

  get rawValue(): string {
    return this.htmlInputElement && this.htmlInputElement.value;
  }

  set rawValue(value: string) {
    this._storedRawValue = value;

    if (this.htmlInputElement) {
      this.htmlInputElement.value = value;
    }
  }

  setCursorAt(position: number): void {
    if (this.htmlInputElement.setSelectionRange) {
      this.htmlInputElement.focus();
      this.htmlInputElement.setSelectionRange(position, position);
    } else if (this.htmlInputElement.createTextRange) {
      let textRange = this.htmlInputElement.createTextRange();
      textRange.collapse(true);
      textRange.moveEnd("character", position);
      textRange.moveStart("character", position);
      textRange.select();
    }
  }

  updateValueAndCursor(newRawValue: string, oldLength: number, selectionStart: number, forceSlice: number): void {
    this.rawValue = newRawValue;
    const newLength = newRawValue.length;
    selectionStart = selectionStart - (oldLength - newLength)  + forceSlice;
    // console.log("cursor setted on " + selectionStart);
    this.setCursorAt(selectionStart);
  }

  isReadOnly() {
    return this.htmlInputElement.readOnly;
  }
}
