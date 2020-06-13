export interface EditorState {
  value?: string;
  previousText?: string;
  tabsInsideCurrentLine?: number;
  currentLine?: number;
  anchorIndex?: number;
  focusIndex?: number;
}
