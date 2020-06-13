export interface EditorState {
  value?: string;
  previousText?: string;
  tabsInsideCurrentLine?: number;
  currentLine?: number;
  anchorIndex?: number;
  focusIndex?: number;
  prevTabsInsideCurrentLine?: number;
  prevCurrentLine?: number;
  prevAnchorIndex?: number;
  prevFocusIndex?: number;
}
