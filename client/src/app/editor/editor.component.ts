import { Component, Input, Output, EventEmitter, OnInit, Renderer2, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ViewContainerRef, TemplateRef, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

enum ChildPosition {
    first,
    last
}

@Component({
    selector: 'editor',
    templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Input() public highlights: string = 'false';
    @Input() public fitEditorToContainer: string = 'false';
    @Input() public editable: string = 'true';
    @Input() public lineNumbering: string = 'true';
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
    private tabsInsideCurrentLine: number = 0;
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

    ngOnDestroy() {
        this.removeCSS('theme');
    }

    removeCSS(cssId) {
        const cssLink = document.querySelector(`head #${cssId}`);

        if(cssLink) {
            cssLink.remove();
        }
    }

    ngAfterViewInit(): void {
        this.setValueInEditor(this.initialValue);

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

    loadCSSOnce(cssId){
        this.removeCSS(cssId)
        const newLink  = document.createElement('link');
        const head  = document.getElementsByTagName('head')[0];

        newLink.id   = cssId;
        newLink.rel  = 'stylesheet';
        newLink.type = 'text/css';
        newLink.href = this.cssUrl;

        head.appendChild(newLink);
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

    onKeyUp(event) {
        this.insertTabsOnNewLine(event);
        this.valueChanged.emit(this.getEditorCode());
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

        const hightlightCode = this.highlights === 'true' && (/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input) || isBackspace || isEnter);

        if (event.keyCode === 9 && event.shiftKey) {
            this.handleDeleteTab(event);
        } else if(event.keyCode === 9) {
            this.handleInsertTab(event, 1);
        } else if(this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
            this.initFirstViewLine(event, false);

            if(hightlightCode) {
                this.currentWordLetters.push(input);
            }
        } else if(hightlightCode) {

            // if(isBackspace) {
            //     this.currentWordLetters.pop();
            // } else if(input === ' ') {
            //     this.currentWord = this.currentWordLetters.join("");
            //     const highlightColor = this.hightlightDict[this.currentWord];

            //     if(highlightColor) {
            //         const text = this.renderer.createText(this.currentWord);
            //         const span = this.renderer.createElement('span');
            //         const sel = document.getSelection();
            //         const editor = this.editor.nativeElement;
            //         const range = new Range();

            //         this.renderer.appendChild(span, text);
            //         this.renderer.setStyle(span, 'color', highlightColor);
            //         this.renderer.appendChild(editor, span);
            //         range.setStartAfter(text);
            //         range.collapse(true);
            //         sel.removeAllRanges();
            //         sel.addRange(range);
            //     }
            // } else {
            //     this.currentWordLetters.push(input);
            // }

        } else {
            const sel = document.getSelection();

            if(sel.anchorNode.nodeName === 'span' && !sel.anchorNode.isSameNode(this.editor.nativeElement)) {
                const range = sel.getRangeAt(0);
                range.setStartAfter(sel.anchorNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        this.refreshTabsCount();
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

    insertTabsOnNewLine(event) {
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

    createTab() {
        const span = document.createElement('span');
        span.appendChild(document.createTextNode('\t'));
        span.style.whiteSpace = 'pre';

        return span;
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

    initFirstViewLine(event, isTab): void {
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

    findClosestPrevNode(anchorNode, tagToLook) {
        let nodeTypeCheck = tagToLook.toLowerCase() === 'text' ? 
        anchorNode.nodeType !== Node.TEXT_NODE : anchorNode.nodeName.toLowerCase() !== tagToLook.toLowerCase();

        while(anchorNode && anchorNode.previousSibling && nodeTypeCheck) {
            anchorNode = anchorNode.previousSibling;
            nodeTypeCheck = tagToLook.toLowerCase() === 'text' ? 
        anchorNode.nodeType !== Node.TEXT_NODE : anchorNode.nodeName.toLowerCase() !== tagToLook.toLowerCase();
        }

        return anchorNode;
    }

    findElement(parent: Node, elementType: string, position: ChildPosition) {
        const children: NodeListOf<ChildNode> = parent.childNodes;
        let child;

        if(children) {
            const length = children.length;

            for(let i = 0; i < length; i++) {
                if(children[i].nodeName.toLowerCase() === elementType.toLowerCase()) {
                    child = children[i];

                    if(position == ChildPosition.first) {
                        break;
                    }
                }
            }
        }

        return child;
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
                        let br = this.renderer.createElement('br');
                        this.renderer.appendChild(viewLine, br);
                        viewLineOpened = false;
                        text = []
                    } else {
                        const firstSpan = this.findElement(viewLine, 'span', ChildPosition.first);
                        let span;

                        if(firstSpan) {
                            span = firstSpan;
                        } else {
                            span = this.renderer.createElement('span');
                            this.renderer.addClass(span, 'tab');
                        }

                        const tab = this.renderer.createText('\t');
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

    handleInsertTab(event, tabs: number): void {
        if(tabs > 0) {
            if(this.editor.nativeElement.querySelectorAll('.view-line').length === 0) {
                this.initFirstViewLine(event, true);
            }
        
            const sel = document.getSelection();
            const range = sel.getRangeAt(0);
            let anchorNode = sel.anchorNode;
            let span = anchorNode;

            range.collapse(true);

            if(anchorNode.nodeName.toLowerCase() === 'div' 
            && !this.findElement(anchorNode, 'span', ChildPosition.first)
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
