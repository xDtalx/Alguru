import { Component, Input, Output, EventEmitter, OnInit, Renderer2, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorService, ChildPosition, EventType } from './editor.service';


@Component({
    selector: 'editor',
    templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Input() public highlights: string = 'false';
    @Input() public fitEditorToContainer: string = 'false';
    @Input() public editable: string = 'true';
    @Input() public lineNumbering: string = 'false';
    @Input() public deletePrevValueOnChange: string = 'false';
    @Input() public value: string = '';
    @Input() public theme: string = 'default';
    @Input() public initialValue: string = '';
    @Output() public valueChanged = new EventEmitter<string>();
    @ViewChild('editor', {read: ElementRef}) editor: ElementRef;

    private currentWordLetters: any[] = [];
    private currentWord: string;
    private hightlightDict = { 'public': 'red' }
    private tabsInsideCurrentLine: number = 0;
    public linesNumbers: number[] = [1];

    constructor(public sanitizer: DomSanitizer, private renderer: Renderer2, public editorService: EditorService) {}

    ngOnInit() {
        this.editorService.selectTheme(this.theme);
    }

    ngOnDestroy() {
        this.editorService.unloadCSS()
    }

    ngAfterViewInit(): void {
        this.setValueInEditor(this.initialValue);
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.initFirstViewLine.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.handleTabs.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.outTheTabSpan.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.highlightCode.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyDown, this.refreshTabsCount.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyUp, this.insertTabsOnNewLine.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.KeyUp, () => this.valueChanged.emit(this.getEditorCode()));
        this.editorService.addEventHandler(this.editor, EventType.Input, this.setViewLineClassToAll.bind(this));
        this.editorService.addEventHandler(this.editor, EventType.Input, this.refreshLineNumbers.bind(this));

        if(this.editable === 'false') {
            this.renderer.setAttribute(this.editor.nativeElement, 'contenteditable', this.editable);
            this.renderer.addClass(this.editor.nativeElement, 'uneditable');
        }

        if(this.fitEditorToContainer === 'true') {
            this.renderer.setStyle(this.editor.nativeElement, 'height', '100%')
        }
    }

    // When code is requested from the server it takes time for it to reach the client.
    // Because of this reason we'll listen to changes in 'value' and update the editor accordingly.
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.value) {
            this.setValueInEditor(changes.value.currentValue);
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
            if(element.nodeName.toLowerCase() === 'div') {
                element.classList.add('view-line');
            }
        });
    }

    handleTabs(event): void {
        if (event.keyCode === 9 && event.shiftKey) {
            this.handleDeleteTab(event);
        } else if(event.keyCode === 9) {
            this.handleInsertTab(event, 1);
        }
    }

    outTheTabSpan(): void {
        const sel = document.getSelection();

        if(sel.anchorNode.nodeName === 'span' && !sel.anchorNode.isSameNode(this.editor.nativeElement)) {
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
            this.highlights === 'true' && (/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isBackspace || isEnter);

        if(isBackspace) {
            this.currentWordLetters.pop();
        } else if(input === ' ') {
            this.currentWord = this.currentWordLetters.join('');
            const highlightColor = this.hightlightDict[this.currentWord];

            if(highlightColor) {
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
        if(this.lineNumbering === 'true') {
            const lines = this.editor.nativeElement.querySelectorAll('.view-line').length;
            const numbers = this.linesNumbers.length;        

            if(lines != numbers) {
                for(let i = 0; i < lines - numbers; i++) {
                    this.linesNumbers.push(numbers + i + 1);
                }

                for(let i = 0; i < (numbers - lines) && numbers > 1; i++) {
                    this.linesNumbers.pop();
                }
            }
        }
    }

    refreshTabsCount(): void {
        const sel = document.getSelection();
        let line = sel.anchorNode;
        
        if(line.isSameNode(this.editor.nativeElement)) {
            this.tabsInsideCurrentLine = 0;
        } else {
            while(line.nodeName.toLowerCase() !== 'div') {
                line = line.parentElement;
            }

            while(line.firstChild && line.firstChild.nodeValue === '') {
                line.firstChild.remove();
            }

            if(line.firstChild && line.firstChild.nodeName.toLowerCase() === 'span') {
                this.tabsInsideCurrentLine = line.firstChild.childNodes.length;
            } else {
                this.tabsInsideCurrentLine = 0;
            }
        }
    }

    insertTabsOnNewLine(event): void {
        if(event.keyCode === 13) {
            const sel = document.getSelection();
            let newViewLine = sel.anchorNode;

            if(newViewLine.nodeName.toLowerCase() !== 'div') {
                newViewLine = newViewLine.parentElement;
            }
            const previousSibling = newViewLine.previousSibling;
            
            if(previousSibling) {
                const prevSiblingText = previousSibling.textContent;

                if(prevSiblingText.lastIndexOf("{") !== -1) {
                    this.tabsInsideCurrentLine++;
                }
                
                this.handleInsertTab(event, this.tabsInsideCurrentLine);
            }
        }
    }

    getEditorCode(): string {
        const editor = this.editor.nativeElement;
        const lines = editor.querySelectorAll('.view-line');
        let code = [];
    
        lines.forEach((value, key, parent) => {
            code.push(value.textContent);
            code.push('\n');
        })
    
        return code.join("");
    }

    initFirstViewLine(event): void {
        if(this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
            const isTab = event.keyCode === 9;
            let input: string;

            if(isTab) {
                input = "";
            } else if(event.keyCode === 219 && event.shiftKey) {
                input = "{";
            } else {
                input = String.fromCharCode(event.keyCode);
            }
        
            if(input && !event.getModifierState('CapsLock')) {
                input = input.toLowerCase();
            }

            if(/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isTab) {
                this.createViewLine(input, input !== null)
                event.preventDefault();
            }
        }
    }

    createViewLine(input: string, caretAfterText: boolean): void {
        const viewLine: HTMLDivElement = document.createElement('div');
        const range: Range = new Range();
        const sel: Selection = document.getSelection();
        const editor: any = this.editor.nativeElement;
        let text: Text;

        viewLine.classList.add('view-line');
        text = document.createTextNode(input);
        viewLine.appendChild(text);
        editor.appendChild(viewLine);
        range.setStartAfter(caretAfterText && input !== null ? text : viewLine);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    handleDeleteTab(event): void {
        let node: Node = document.getSelection().anchorNode;

        if(node) {
            while(node.nodeName.toLowerCase() !== 'div') {
                node = node.parentElement;
            }

            let firstSpan = node.firstChild;

            while(firstSpan && firstSpan.nodeValue === '') {
                node.firstChild.remove();
                firstSpan = node.firstChild;
            }

            if(firstSpan && firstSpan.firstChild) {
                firstSpan.firstChild.remove();
            
                if(!firstSpan.firstChild && firstSpan.parentElement.childNodes.length > 1) {
                    firstSpan.parentElement.removeChild(firstSpan);
                }
            }
        }
    
        event.preventDefault();
    }

    setValueInEditor(value: string): void {
        if(this.editor && value && value !== '') {
            const editor: HTMLElement = this.editor.nativeElement;
            let viewLineOpened: boolean = false;
            let viewLine: HTMLDivElement;

            if(this.deletePrevValueOnChange === 'true') {
                editor.innerHTML = '';
            }

            if(value.charAt(value.length - 1) !== '\n') {
                value += '\n';
            }

            Array.from(value).forEach(char => {
                if(!viewLineOpened) {
                    viewLineOpened = true;
                    viewLine = this.editorService.addNewLine(editor);
                }

                if(char === '\n' || char === '\t') {
                    this.editorService.appendText(viewLine);

                    if(char === '\n') {
                        viewLineOpened = false;
                    } else {
                        this.editorService.appendTab(viewLine);
                    }
                } else {
                    this.editorService.buildString(char);
                }
            });

            this.refreshLineNumbers();
        }
    }

    handleInsertTab(event, tabs: number): void {
        if(tabs > 0) {
            const sel = document.getSelection();
            const range = sel.getRangeAt(0);
            let anchorNode = sel.anchorNode;
            let span = anchorNode;

            range.collapse(true);

            if(anchorNode.nodeName.toLowerCase() === 'div' 
            && !this.editorService.findElement(anchorNode, 'span', ChildPosition.First)
            || anchorNode.nodeType === Node.TEXT_NODE) {
                span = this.renderer.createElement('span');
                this.renderer.addClass(span, 'tab');
                range.insertNode(span);
            } 

            for(let i = 0; i < tabs; i++) {
                const tab = this.renderer.createText('\t');
                span.appendChild(tab);
                range.setStartAfter(tab);
                range.collapse(true);
            }

            sel.removeAllRanges();
            sel.addRange(range);
        }

        event.preventDefault();
    }
}
