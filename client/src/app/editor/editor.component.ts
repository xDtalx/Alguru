import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    Renderer2,
    OnChanges,
    SimpleChanges,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ViewEncapsulation,
    OnDestroy} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorService, EventType, Hightlighter } from './editor.service';
import { ThemeService } from '../theme/theme.service';


@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: [ './editor.component.css' ],
    encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Input() public highlights = 'false';
    @Input() public fitEditorToContainer = 'false';
    @Input() public editable = 'true';
    @Input() public lineNumbering = 'false';
    @Input() public deletePrevValueOnChange = 'false';
    @Input() public value = '';
    @Input() public theme = 'light';
    @Input() public initialValue = '';
    @Output() public valueChanged = new EventEmitter<string>();
    @ViewChild('editor', {read: ElementRef}) editor: ElementRef;

    private currentWordLetters: any[] = [];
    private currentWord: string;
    private hightlightDict = { public: 'red' };
    private tabsInsideCurrentLine = 0;
    private currentLine = -1;
    private anchorIndex: number;
    private focusIndex: number;
    private previousText: string;
    public linesNumbers: number[] = [1];

    constructor(
        public sanitizer: DomSanitizer,
        private renderer: Renderer2,
        public editorService: EditorService,
        private themeService: ThemeService) {}

    ngOnDestroy(): void {
        this.themeService.reset();
    }

    ngOnInit(): void {
        this.themeService.setActiveThemeByName(this.theme);
    }

    ngAfterViewInit(): void {
        this.renderText(this.initialValue);
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.initFirstViewLine.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.handleLineCut.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.handleTabs.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.outTheTabSpan.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.refreshTabsCount.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyUp, this.insertTabsOnNewLine.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyUp, this.refreshLocation.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyUp, this.onTextChanged.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.Input, this.setViewLineClassToAll.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.Input, this.refreshLineNumbers.bind(this));

        if (this.editable === 'false') {
            this.renderer.setAttribute(this.editor.nativeElement, 'contenteditable', this.editable);
            this.renderer.addClass(this.editor.nativeElement, 'uneditable');
        }

        if (this.fitEditorToContainer === 'true') {
            this.renderer.setStyle(this.editor.nativeElement, 'height', '100%');
        }
    }

    onTextChanged(event) {
        const lines = [];

        this.getTextSegments(this.editor.nativeElement, true).forEach(line => {
            lines.push(line.text);
            lines.push('\n');
        });

        const text = lines.join('');

        if (text !== this.previousText) {
            this.valueChanged.emit(text);
            this.renderText(text);
            this.restoreSelection();
            this.previousText = text;
        }
    }

    getSelectedElementParentLine(selection: Selection): HTMLElement {
        let element = selection.anchorNode as HTMLElement;
        let line;

        while (element && !element.isSameNode(this.editor.nativeElement)) {
            line = element;
            element = element.parentElement;
        }

        return line;
    }

    refreshCurrentLine(lineElement: Node): void {
        const lines: NodeList = this.editor.nativeElement.querySelectorAll('.view-line');
        const linesCount = lines.length;

        for (let i = 0; i < linesCount; i++) {
            this.currentLine = i;

            if (lines[i] === lineElement) {
                break;
            }
        }
    }

    refreshLocation(): void {
        const sel: Selection = document.getSelection();
        const line: HTMLElement = this.getSelectedElementParentLine(sel);

        if (line) {
            this.refreshCurrentLine(line);

            let currentIndex = 0;
            const textSegments = this.getTextSegments(line, false);

            textSegments.forEach(({text, node}) => {
                if (node === sel.anchorNode) {
                    this.anchorIndex = currentIndex + sel.anchorOffset;
                } else if (node.parentElement === sel.anchorNode) {
                    const range = new Range();
                    range.selectNode(node);
                    this.anchorIndex = currentIndex + sel.anchorOffset - range.startOffset;
                }

                if (node === sel.focusNode) {
                    this.focusIndex = currentIndex + sel.focusOffset;
                } else if (node.parentElement === sel.focusNode) {
                    const range = new Range();
                    range.selectNode(node);
                    this.focusIndex = currentIndex + sel.focusOffset - range.startOffset;
                }

                currentIndex += text.length;
            });
        } else {
            this.currentLine = 0;
            this.anchorIndex = 0;
            this.focusIndex = 0;
        }
    }

    restoreSelection() {
        const sel = window.getSelection();
        const lines: NodeList = this.editor.nativeElement.querySelectorAll('.view-line');
        const line: Node = lines[this.currentLine];
        const textSegments = this.getTextSegments(line, false);

        let anchorNode = line;
        let anchorIndex = 0;
        let focusNode = line;
        let focusIndex = 0;
        let currentIndex = 0;

        textSegments.forEach(({text, node}) => {
            const startIndexOfNode = currentIndex;
            const endIndexOfNode = startIndexOfNode + text.length;

            if (startIndexOfNode <= this.anchorIndex && this.anchorIndex <= endIndexOfNode) {
                anchorNode = node;
                anchorIndex = this.anchorIndex - startIndexOfNode;
            }

            if (startIndexOfNode <= this.focusIndex && this.focusIndex <= endIndexOfNode) {
                focusNode = node;
                focusIndex = this.focusIndex - startIndexOfNode;
            }

            currentIndex += text.length;
        });

        sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
    }

    // When code is requested from the server it takes time for it to reach the client.
    // Because of this reason we'll listen to changes in 'value' and update the editor accordingly.
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.value) {
            this.renderText(changes.value.currentValue);
        }
    }

    onInput(event): void {
        this.editorService.handleEvent(this.editor, event);
    }

    onKeyUp(event): void {
        this.editorService.handleEvent(this.editor, event);
    }

    onKeyDown(event): void {
        this.editorService.handleEvent(this.editor, event);
    }

    setViewLineClassToAll(event): void {
        const editor = event.target;

        editor.childNodes.forEach(element => {
            if (element.nodeName.toLowerCase() === 'div') {
                element.classList.add('view-line');
            }
        });
    }

    handleLineCut(event): void {
        if (event.ctrlKey && event.keyCode === 88) {
            const sel = document.getSelection();

            if (sel && sel.anchorNode && !sel.anchorNode.isSameNode(this.editor.nativeElement)) {
                const range = sel.getRangeAt(0);
                let node: HTMLElement = sel.anchorNode as HTMLElement;

                if (range.startOffset === range.endOffset) {
                    while ((!node.classList || !node.classList.contains('view-line'))
                    && !node.isSameNode(this.editor.nativeElement)) {
                        node = node.parentElement;
                    }

                    if (!node.isSameNode(this.editor.nativeElement)) {
                        const sibling = node.nextSibling ? node.nextSibling : node.previousSibling;
                        node.parentElement.removeChild(node);

                        if (sibling) {
                            if (sibling.firstChild && sibling.firstChild.nodeName.toLowerCase() !== 'br') {
                                range.setStart(sibling.firstChild, 0);
                            } else {
                                range.setStart(sibling, 0);
                            }

                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            this.setLineNumberToReturn(sibling);
                        }

                        this.refreshLineNumbers();
                    }
                }
            }
        }
    }

    setLineNumberToReturn(line: Node) {
        const lines = this.editor.nativeElement.querySelectorAll('.view-line');

        for (let i = 0; i < lines.length; i++) {
            this.currentLine = i;

            if (lines[i] === line) {
                break;
            }
        }
    }

    handleTabs(event): void {
        if (event.keyCode === 9 && event.shiftKey) {
            this.handleDeleteTab(event);
        } else if (event.keyCode === 9) {
            this.handleInsertTab(event, 1);
        }
    }

    outTheTabSpan(): void {
        const sel = document.getSelection();

        if (sel.anchorNode &&
            sel.anchorNode.nodeName === 'span' &&
            !sel.anchorNode.isSameNode(this.editor.nativeElement)) {

            const range = sel.getRangeAt(0);

            range.setStartAfter(sel.anchorNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    highlightCode(event): void {
        const input = this.editorService.applyCapsLock(event);
        const isBackspace = event.keyCode === 8;
        const isEnter = event.keyCode === 13;
        const hightlightCode =
            this.highlights === 'true' &&
            (/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isBackspace || isEnter);

        if (isBackspace) {
            this.currentWordLetters.pop();
        } else if (input === ' ') {
            this.currentWord = this.currentWordLetters.join('');
            const highlightColor = this.hightlightDict[this.currentWord];

            if (highlightColor) {
                const text = this.renderer.createText(this.currentWord);
                const span = this.renderer.createElement('span');
                const sel = document.getSelection();
                const editor = this.editor.nativeElement;
                const range = new Range();

                this.renderer.appendChild(span, text);
                this.renderer.setStyle(span, 'color', highlightColor);
                this.renderer.appendChild(editor, span);
                range.setStartAfter(text);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            this.currentWordLetters.push(input);
        }
    }

    refreshLineNumbers(): void {
        if (this.lineNumbering === 'true') {
            const lines = this.editor.nativeElement.querySelectorAll('.view-line').length;
            const numbers = this.linesNumbers.length;

            if (lines !== numbers) {
                for (let i = 0; i < lines - numbers; i++) {
                    this.linesNumbers.push(numbers + i + 1);
                }

                for (let i = 0; i < (numbers - lines) && numbers > 1; i++) {
                    this.linesNumbers.pop();
                }
            }
        }
    }

    refreshTabsCount(): void {
        const sel = document.getSelection();
        let line: HTMLElement = sel.anchorNode as HTMLElement;
        this.tabsInsideCurrentLine = 0;

        if (line) {
            while (line
                && !line.isSameNode(this.editor.nativeElement)
                && (!line.classList || !line.classList.contains('view-line'))) {

                line = line.parentElement;
            }

            let child: HTMLElement = line.firstChild as HTMLElement;
            this.tabsInsideCurrentLine = 0;

            while (child && child.classList && child.classList.contains('tab')) {
                this.tabsInsideCurrentLine++;
                child = child.nextSibling as HTMLElement;
            }
        }
    }

    insertTabsOnNewLine(event): void {
        if (event.keyCode === 13) {
            const sel = document.getSelection();
            let newViewLine = sel.anchorNode;

            if (newViewLine.nodeName.toLowerCase() !== 'div') {
                newViewLine = newViewLine.parentElement;
            }

            const previousSibling = newViewLine.previousSibling;

            if (previousSibling) {
                const prevSiblingText = previousSibling.textContent;

                if (prevSiblingText.lastIndexOf('{') !== -1) {
                    this.tabsInsideCurrentLine++;
                }

                this.handleInsertTab(event, this.tabsInsideCurrentLine);
            }
        }
    }

    insertBRIfLineEmpty(event): void {
        const sel: Selection = document.getSelection();
        const anchorNode: HTMLElement = sel.anchorNode as HTMLElement;

        if (anchorNode.classList.contains('view-line') && anchorNode.childNodes.length === 0) {
            this.renderer.appendChild(anchorNode, this.renderer.createElement('br'));
        }
    }

    getTextSegments(element: Node, oneLevelChild: boolean): {text: string, node: Node}[] {
        const textSegments: {text: string, node: Node}[] = [];

        if (element) {
            Array.from(element.childNodes).forEach(node => {
                switch (node.nodeType) {
                    case Node.TEXT_NODE:
                        textSegments.push({text: node.textContent, node});
                        break;

                    case Node.ELEMENT_NODE:
                        if (oneLevelChild) {
                            textSegments.push({text: node.textContent, node});
                        } else {
                            textSegments.splice(textSegments.length, 0, ...(this.getTextSegments(node, oneLevelChild)));
                        }
                        break;

                    default:
                        throw new Error(`Unexpected node type: ${node.nodeType}`);
                }
            });
        }

        return textSegments;
    }

    initFirstViewLine(event): void {
        if (this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
            const isTab = event.keyCode === 9;
            let input: string;

            if (event.keyCode === 219 && event.shiftKey) {
                input = '{';
            } else {
                input = String.fromCharCode(event.keyCode);
            }

            if (input && !event.getModifierState('CapsLock')) {
                input = input.toLowerCase();
            }

            if (/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isTab) {
                this.editorService.addNewLine(this.editor.nativeElement, true);
            }
        }
    }

    handleDeleteTab(event): void {
        let node: HTMLElement = document.getSelection().anchorNode as HTMLElement;

        if (node) {
            while (node.nodeName.toLowerCase() !== 'div') {
                node = node.parentElement;
            }

            let firstSpan: HTMLElement = node.firstChild as HTMLElement;

            while (firstSpan &&  firstSpan.classList && firstSpan.classList.contains('tab') && firstSpan.nodeValue === '') {
                node.firstChild.remove();
                firstSpan = node.firstChild as HTMLElement;
            }

            if (firstSpan && firstSpan.classList && firstSpan.classList.contains('tab') && firstSpan.firstChild) {
                firstSpan.firstChild.remove();

                if (!firstSpan.firstChild) {
                    const parent = firstSpan.parentElement;
                    parent.removeChild(firstSpan);

                    if (parent.childNodes.length === 0) {
                        const br = this.renderer.createElement('br');
                        this.renderer.appendChild(parent, br);
                    }
                }
            }
        }

        event.preventDefault();
    }

    renderText(value: string): void {
        if (this.editor && value && value !== '') {
            const editor: HTMLElement = this.editor.nativeElement;
            let viewLineOpened = false;
            let viewLine: HTMLDivElement;

            if (this.deletePrevValueOnChange === 'true' || this.highlights === 'true') {
                editor.innerHTML = '';
            }

            if (value.charAt(value.length - 1) !== '\n') {
                value += '\n';
            }

            Array.from(value).forEach(char => {
                if (!viewLineOpened) {
                    viewLineOpened = true;
                    viewLine = this.editorService.addNewLine(editor);
                }

                if (! /^\s+$/.test(char)) {
                    this.editorService.buildString(char);
                } else {
                    if (this.highlights === 'true') {
                        this.editorService.appendText(viewLine, null, Hightlighter.Java);
                    } else {
                        this.editorService.appendText(viewLine);
                    }

                    if (char === '\n') {
                        viewLineOpened = false;
                    } else if (char === '\t') {
                        this.editorService.appendTab(viewLine);
                    } else if (char === ' ') {
                        this.editorService.addSpace(viewLine);
                    }
                }
            });

            this.refreshLineNumbers();
        }
    }

    handleInsertTab(event, tabs: number): void {
        if (tabs > 0) {
            const sel = document.getSelection();
            const range = sel.getRangeAt(0);
            let anchorNode: HTMLElement = sel.anchorNode as HTMLElement;
            let span;
            let tab;

            range.collapse(true);

            while ((!anchorNode.classList || !anchorNode.classList.contains('view-line'))
            && !anchorNode.isSameNode(this.editor.nativeElement)) {
                anchorNode = anchorNode.parentElement;
            }

            if (anchorNode instanceof HTMLDivElement) {
                this.editorService.removeBR(anchorNode as HTMLDivElement);

                for (let i = 0; i < tabs; i++) {
                    tab = this.renderer.createText('\t');
                    span = this.renderer.createElement('span');
                    this.renderer.addClass(span, 'tab');
                    this.renderer.appendChild(span, tab);
                    range.insertNode(span);
                    range.setStartAfter(tab);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        event.preventDefault();
    }
}
