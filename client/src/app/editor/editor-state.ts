export interface EditorState {
    value: string;
    tabsInsideCurrentLine: number;
    currentLine: number;
    anchorIndex: number;
    focusIndex: number;
    previousText: string;
}
