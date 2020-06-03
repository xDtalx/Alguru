import { CodeType } from './code.type';
import { Highlighter } from './highlighter';
import { JavaHighlighter } from './java.highlighter';
import { Renderer2 } from '@angular/core';

export class Hightlights {
  private highlighter: Highlighter;
  private currentCodeType: CodeType;

  getByCodeType(codeType: CodeType, renderer: Renderer2) {
    switch (codeType) {
      case CodeType.Java:
        if (!this.highlighter || this.currentCodeType !== CodeType.Java) {
          this.highlighter = new JavaHighlighter(renderer);
        }
        break;
    }

    return this.highlighter;
  }
}

let highlights;

export function getHighlights(): Hightlights {
  if (!highlights) {
    highlights = new Hightlights();
  }

  return highlights;
}
