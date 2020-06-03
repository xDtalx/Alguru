import { Renderer2 } from '@angular/core';
import { Highlighter } from './highlighter';

export interface LangHighlightInfo {
  getHighlighter(renderer: Renderer2): Highlighter;
}
