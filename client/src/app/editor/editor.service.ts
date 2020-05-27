import { Injectable, ElementRef, Renderer2, RendererFactory2  } from '@angular/core';
import { getHighlights } from './highlighters/highlights';
import { Highlighter } from './highlighters/highlighter';
import { CodeType } from './highlighters/code.type';

export enum ChildPosition {
    First,
    Last
}

export enum EventType {
    KeyUp = 'keyup',
    KeyDown = 'keydown',
    KeyPressed = 'keypressed',
    MouseDown = 'mousedown',
    MouseUp = 'mouseup',
    Click = 'click',
    Input = 'input'
}

@Injectable({ providedIn: 'root' })
export class EditorService {
    private renderer: Renderer2;
    private stringBuilder: any[][] = [[]];
    private eventsCallbacks: Map<ElementRef, Map<string, ((event: Event) => void)[]>> =
        new Map<ElementRef, Map<string, ((event: Event) => void)[]>>();

    constructor(private rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    addEventHandler(element: ElementRef, eventType: EventType, callback: (event: Event) => void): void {
        if (this.eventsCallbacks.get(element)) {
            const eventHandlers = this.eventsCallbacks.get(element);
            const callbacks = eventHandlers.get(eventType);

            if (callbacks) {
                callbacks.push(callback);
            } else {
                eventHandlers.set(eventType, [callback]);
            }
        } else {
            const eventHandlers = new Map<string, ((event: Event) => void)[]>();
            eventHandlers.set(eventType, [callback]);
            this.eventsCallbacks.set(element, eventHandlers);
        }
    }

    handleEvent(element: ElementRef, event: Event): void {
        const eventHandlers = this.eventsCallbacks.get(element);

        if (eventHandlers) {
            const callBacks = eventHandlers.get(event.type);

            if (callBacks) {
                callBacks.forEach(callback => {
                    callback(event);
                });
            }
        }
    }

    applyCapsLock(event): string {
        let input = String.fromCharCode(event.keyCode);

        if (/[ a-zA-Z ]/.test(input)) {
            if (!event.getModifierState('CapsLock')) {
                input = input.toLowerCase();
            }
        } else {
            input = ' ';
        }

        return input;
    }

    findClosestPrevNode(anchorNode: Node, nodeToLook: string): Node {
        let nodeTypeCheck = nodeToLook.toLowerCase() === 'text' ?
        anchorNode.nodeType !== Node.TEXT_NODE : anchorNode.nodeName.toLowerCase() !== nodeToLook.toLowerCase();

        while (anchorNode && anchorNode.previousSibling && nodeTypeCheck) {
            anchorNode = anchorNode.previousSibling;
            nodeTypeCheck = nodeToLook.toLowerCase() === 'text' ?
        anchorNode.nodeType !== Node.TEXT_NODE : anchorNode.nodeName.toLowerCase() !== nodeToLook.toLowerCase();
        }

        return anchorNode;
    }

    findElement(parent: Node, elementType: string, position: ChildPosition): HTMLElement {
        const children: NodeListOf<ChildNode> = parent.childNodes;
        let child;

        if (children) {
            const length = children.length;

            for (let i = 0; i < length; i++) {
                if (children[i].nodeName.toLowerCase() === elementType.toLowerCase()) {
                    child = children[i];

                    if (position === ChildPosition.First) {
                        break;
                    }
                }
            }
        }

        return child;
    }

    createNewLine(content?: any): HTMLDivElement {
        const newLine: HTMLDivElement = this.renderer.createElement('div');
        this.renderer.addClass(newLine, 'view-line');

        if (content) {
            if (typeof content === 'string') {
                const text = this.renderer.createText(content);
                this.renderer.appendChild(newLine, text);
            } else {
                newLine.appendChild(content);
            }
        } else {
            const br = this.renderer.createElement('br');
            this.renderer.appendChild(newLine, br);
        }

        return newLine;
    }

    getSelectedElementParentLine(editor: HTMLElement, selection: Selection): HTMLElement {
        let element = selection.focusNode as HTMLElement;
        let line;

        while (element && !element.isSameNode(editor)) {
            line = element;
            element = element.parentElement;
        }

        return line;
    }

    addNewLine(editor: HTMLElement, content?: any, setCaretIn?: boolean, after?: Node): HTMLDivElement {
        const newLine: HTMLDivElement = this.createNewLine(content);

        if (after) {
            if (after.nextSibling) {
                this.renderer.insertBefore(editor, newLine, after.nextSibling);
            } else {
                this.renderer.appendChild(editor, newLine);
            }
        } else {
            this.renderer.appendChild(editor, newLine);
        }

        if (setCaretIn) {
            const sel = document.getSelection();

            if (sel && sel.anchorNode) {
                const range = sel.getRangeAt(0);
                range.setStart(newLine, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        return newLine;
    }

    appendText(line: HTMLDivElement, text: string): string {
        let newText: HTMLElement;

        if (text) {
            newText = this.renderer.createText(text);
        }

        if (newText) {
            this.removeBR(line);
            this.renderer.appendChild(line, newText);
        }

        return text;
    }

    addSpace(line: HTMLDivElement, asTextNode: boolean) {
        const space = this.renderer.createText(' ');

        if (asTextNode) {
            this.renderer.appendChild(line, space);
        } else {
            const span = this.renderer.createElement('span');
            this.renderer.appendChild(span, space);
            this.renderer.appendChild(line, span);
        }
    }

    // isStructuralChar(char: any, codeType: CodeType): boolean {
    //     return hightlights[codeType][char] === KeywordType.Structural;
    // }

    private getText(codeType?: CodeType): HTMLElement {
        let container: HTMLElement;
        let line: string;

        if (this.stringBuilder[0].length > 0) {
            line = this.stringBuilder.map(letters => letters.join('')).join(' ');

            if (codeType) {
                container = this.renderer.createElement('span');
                const highlighter: Highlighter = getHighlights().getByCodeType(codeType, this.renderer);

                if (highlighter) {
                    highlighter.highlight(line, container);
                    this.stringBuilder = [[]];
                }
            }
        }

        return codeType ? container : this.renderer.createText(line);
    }

    // private findSpecials(word: string, codeType?: CodeType): string[] {
    //     const specials: string[] = [];

    //     Object.keys(hightlights[codeType].special).forEach(special => {
    //         const lastIndex = word.lastIndexOf(special);

    //         if (lastIndex) {
    //             specials.push(special);
    //         }
    //     });

    //     return specials;
    // }

    private appendHighlitedText(container: HTMLElement, text: string, styleClass: string) {
        const highlightSpan = this.renderer.createElement('span');
        this.renderer.addClass(highlightSpan, styleClass);
        this.renderer.addClass(highlightSpan, 'hightlight');
        this.renderer.appendChild(highlightSpan, this.renderer.createText(text));
        this.renderer.appendChild(container, highlightSpan);
    }

    // getContained(codeType: CodeType, word: string): {str: string, type: Specials} {
    //     let result: {str: string, type: Specials};

    //     if (word && word.length > 0) {
    //         const wordLength = word.length;

    //         for (let i = 1; i <= wordLength; i++) {
    //             const subString: string = word.substring(0, i);
    //             let containedType = hightlights[codeType];

    //             if (containedType) {
    //                 containedType = hightlights[codeType].special[subString];
    //             }

    //             if (containedType) {
    //                 result = {
    //                     str: subString,
    //                     type: containedType
    //                 };
    //                 break;
    //             }
    //         }
    //     }

    //     return result;
    // }

    removeBR(line: HTMLDivElement) {
        const br = this.findElement(line, 'br', ChildPosition.First);

        if (br) {
            this.renderer.removeChild(line, br);
        }
    }

    buildString(char: any): void {
        if (char === ' ') {
            this.stringBuilder.push([]);
        } else {
            this.stringBuilder[this.stringBuilder.length - 1].push(char);
        }
    }

    appendTab(line: HTMLDivElement, asTextNode: boolean): void {
        this.removeBR(line);
        const tab = this.renderer.createText('\t');

        if (asTextNode) {
            this.renderer.appendChild(line, tab);
        } else {
            const span = this.renderer.createElement('span');
            this.renderer.addClass(span, 'tab');
            this.renderer.appendChild(span, tab);
            this.renderer.appendChild(line, span);
        }
    }
}
