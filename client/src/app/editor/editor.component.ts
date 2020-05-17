import { Component, Input, Output, EventEmitter, OnInit, Renderer2, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ViewContainerRef, TemplateRef, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'editor',
    templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnChanges, AfterViewInit {

    @Input() public highlights: string = 'false';
    @Input() public editable: string = 'true';
    @Input() public lineNumbering: string = 'false';
    @Input() public deletePrevValueOnChange: string = 'false';
    @Input() public value: string = '';
    @Input() public theme: string = 'default';
    @Input() public initialValue: string = '';
    @Output() public valueChanged = new EventEmitter<string>();
    @ViewChild('editor', {read: ElementRef}) editor: ElementRef;

    private cssUrl: string;
    private currentWordLetters: any[] = [];
    private currentWord: string;
    private hightlightDict = { 'public': 'red' }
    public linesNumbers: number[] = [1];

    constructor(public sanitizer: DomSanitizer, private renderer: Renderer2) {}

    ngOnInit() {
        switch(this.theme) {
            case 'dark':
                this.cssUrl = '/assets/editor/editor-dark.css';
                break;
            default:
                this.cssUrl = '/assets/editor/editor-default.css';
        }

        this.loadCSSOnce('theme');
    }

    ngAfterViewInit(): void {
        this.setValueInEditor(this.initialValue);

        if(this.editable === 'false') {
            this.renderer.setAttribute(this.editor.nativeElement, 'contenteditable', this.editable);
            this.renderer.addClass(this.editor.nativeElement, 'uneditable');
        }
    }

    // When code is requested from the server it takes time for it to reach the client.
    // Because of this reason we'll listen to changes in 'value' and update the editor accordingly.
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.value) {
            this.setValueInEditor(changes.value.currentValue);
        }
    }

    loadCSSOnce(cssId){
        const link = document.getElementById(cssId);

        if (!link || link.getAttribute("href") !== this.cssUrl) {

            if(link) {
                link.remove();
            }

            const newLink  = document.createElement('link');
            const head  = document.getElementsByTagName('head')[0];

            newLink.id   = cssId;
            newLink.rel  = 'stylesheet';
            newLink.type = 'text/css';
            newLink.href = this.cssUrl;

            head.appendChild(newLink);

        }
    }

    setValueInEditor(value) {
        if(this.editor && value && value !== '') {
            const editor = this.editor.nativeElement;
            let valueLength: number = value.length;

            if(this.deletePrevValueOnChange === 'true') {
                editor.innerHTML = '';
            }

            if(value.charAt(valueLength - 1) !== '\n') {
                valueLength++;
                value += '\n';
            }

            let viewLineOpened = false;
            let text = [];
            let viewLine;

            for(let i = 0; i < valueLength; i++) {
                if(!viewLineOpened) {
                    viewLineOpened = true;
                    viewLine = this.renderer.createElement('div');
                    this.renderer.addClass(viewLine, 'view-line');
                    editor.appendChild(viewLine);
                }
                
                const currentChar = value.charAt(i);

                if(currentChar === '\n' || currentChar === '\t') {
                    const textElem = this.renderer.createText(text.join(""));
                    this.renderer.appendChild(viewLine, textElem);

                    if(currentChar === '\n') {
                        viewLineOpened = false;
                        text = []
                    } else {
                        const span = this.renderer.createElement('span');
                        const tab = this.renderer.createText('\t');
                        this.renderer.setStyle(span, 'white-space', 'pre')
                        this.renderer.appendChild(span, tab);
                        this.renderer.appendChild(viewLine, span);
                    }
                } else {
                    text.push(currentChar)
                }
            }

            this.refreshLineNumbers(editor);
        }
    }

    onInput(event) {
        const editor = event.target;

        editor.childNodes.forEach(element => {
            if(element.nodeName.toLowerCase() === 'div') {
                element.classList.add('view-line');
            }
        });

        this.refreshLineNumbers(editor);
    }

    refreshLineNumbers(editor) {
        if(this.lineNumbering === 'true') {
            const lines = editor.querySelectorAll('.view-line').length;
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

    onKeyUp(event) {
        this.valueChanged.emit(this.getEditorCode());
    }

    getEditorCode() {
        const editor = this.editor.nativeElement;
        const lines = editor.querySelectorAll('.view-line');
        let code = [];
    
        lines.forEach((value, key, parent) => {
            code.push(value.textContent);
            code.push('\n');
        })
    
        return code.join("");
    }

    initFirstViewLine(event, isTab) {
        let input = isTab ? "" : String.fromCharCode(event.keyCode);
    
        if(!event.getModifierState('CapsLock')) {
            input = input.toLowerCase();
        }
        
        if(/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isTab) {
            this.createViewLine(input, true)
            event.preventDefault();
        }
    }

    createViewLine(input: string, caretAfterText: boolean) {
        const viewLine = document.createElement('div');
        const text = document.createTextNode(input);
        const range = new Range();
        const sel = document.getSelection();
        const editor = this.editor.nativeElement;

        viewLine.classList.add('view-line');
        viewLine.appendChild(text);
        editor.appendChild(viewLine);
        range.setStartAfter(caretAfterText ? text : viewLine);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    handleDeleteTab(event) {
        const anchorNode = document.getSelection().anchorNode;
        let nodeToTraverse = anchorNode.nodeType === Node.ELEMENT_NODE || anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentNode : anchorNode;
    
        if(anchorNode) {
            if(anchorNode.nodeName.toLowerCase() === 'div') {
                nodeToTraverse = anchorNode;
            }
            
            const childNodesLength = nodeToTraverse.childNodes.length;
    
            for(let i = 0; i < childNodesLength; i++) {
                let childNode = nodeToTraverse.childNodes[i];
    
                if(childNode && childNode.nodeName.toLowerCase() === 'span') {
                    nodeToTraverse.removeChild(childNode);
                    break;
                }
            }
        }
    
        event.preventDefault();
    }

    handleInsertTab(event) {
        if(this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
            this.initFirstViewLine(event, true);
        }
    
        const sel = document.getSelection();
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');

        range.collapse(true);
        span.appendChild(document.createTextNode('\t'));
        span.style.whiteSpace = 'pre';
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        
        event.preventDefault();
    }

    onKeyDown(event) {
        const isBackspace = event.keyCode === 8;
        const isEnter = event.keyCode === 13;
        let input = ' ';
        
        if(!isBackspace && !isEnter) {
            input = String.fromCharCode(event.keyCode);
            
            if(!event.getModifierState('CapsLock')) {
                input = input.toLowerCase();
            }
        }

        const hightlightCode = this.highlights === 'true' && (/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isBackspace || isEnter)
        
        if (event.keyCode === 9 && event.shiftKey) {
            this.handleDeleteTab(event);
        } else if(event.keyCode === 9) {
            this.handleInsertTab(event);
        } else if(this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
            this.initFirstViewLine(event, false);

            if(hightlightCode) {
                this.currentWordLetters.push(input);
            }
        } else if(hightlightCode) {

            if(isBackspace) {
                this.currentWordLetters.pop();
            } else if(input === ' ') {
                this.currentWord = this.currentWordLetters.join("");
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
    }
}