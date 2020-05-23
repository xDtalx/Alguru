import { Injectable, ElementRef, Renderer2, RendererFactory2  } from '@angular/core';
import { hightlights } from './highlights';
import { version } from 'punycode';

export enum ChildPosition {
    First,
    Last
}

export enum Hightlighter {
    Java = 'Java'
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
        const kbEvent = event as KeyboardEvent;
        let isKBArrowEvent = false;

        if (kbEvent) {
            // tslint:disable-next-line: deprecation
            isKBArrowEvent = kbEvent.keyCode >= 37 &&  kbEvent.keyCode <= 40;
        }

        if (!isKBArrowEvent) {
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

    addNewLine(editor: HTMLElement, setCaretIn: boolean = false): HTMLDivElement {
        const newLine = this.renderer.createElement('div');
        const br = this.renderer.createElement('br');
        this.renderer.appendChild(newLine, br);
        this.renderer.addClass(newLine, 'view-line');
        this.renderer.appendChild(editor, newLine);

        if (setCaretIn) {
            const sel = document.getSelection();

            if (sel && sel.anchorNode && !sel.anchorNode.isSameNode(editor)) {
                const range = sel.getRangeAt(0);
                range.setStart(newLine, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        return newLine;
    }

    appendText(line: HTMLDivElement, text?: string, hightlighter?: Hightlighter): void {
        let newText: HTMLElement;

        if (text) {
            newText = this.renderer.createText(text);
        } else if (this.stringBuilder.length > 0) {
            newText = this.getText(hightlighter);
        }

        if (this.stringBuilder.length > 0 && this.stringBuilder[0].length > 0) {
            this.removeBR(line);

            if (hightlighter) {
                Array.from(newText.childNodes).forEach(value => this.renderer.appendChild(line, value));
            } else {
                this.renderer.appendChild(line, newText);
            }

            this.stringBuilder = [[]];
        }
    }

    addSpace(line: HTMLDivElement) {
        const span = this.renderer.createElement('span');
        const space = this.renderer.createText(' ');
        this.renderer.appendChild(span, space);
        this.renderer.appendChild(line, span);
    }

    private getText(hightlighter?: Hightlighter): HTMLElement {
        let container: HTMLElement;
        let words: string[] = [];

        if (hightlighter) {
            container = this.renderer.createElement('div');
        }

        if (this.stringBuilder[0].length > 0) {
            this.stringBuilder.forEach((letters, index) => {
                const word = letters.join('');

                if (hightlighter) {
                    const keyWordType = hightlights[hightlighter][word];

                    if (keyWordType) {
                        if (words.length > 0) {
                            words.push(' ');
                            this.renderer.appendChild(container, this.renderer.createText(words.join('')));
                            words = [];
                        }

                        const highlightSpan = this.renderer.createElement('span');
                        this.renderer.addClass(highlightSpan, keyWordType);
                        this.renderer.addClass(highlightSpan, 'hightlight');
                        this.renderer.appendChild(highlightSpan, this.renderer.createText(word));
                        this.renderer.appendChild(container, highlightSpan);
                    } else {
                        if (index > 0) {
                            words.push(' ');
                        }

                        words.push(word);
                    }

                    if (words.length > 0) {
                        this.renderer.appendChild(container, this.renderer.createText(words.join('')));
                        words = [];
                    }
                } else {
                    words.push(word);
                }
            });
        }


        return hightlighter ? container : this.renderer.createText(words.join(' '));
    }

    removeBR(line: HTMLDivElement) {
        const br = this.findElement(line, 'br', ChildPosition.First);

        if (br) {
            this.renderer.removeChild(line, br);
        }
    }

    buildString(char): void {
        if (char === ' ') {
            this.stringBuilder.push([]);
        } else {
            this.stringBuilder[this.stringBuilder.length - 1].push(char);
        }
    }

    appendTab(line: HTMLDivElement): void {
        this.removeBR(line);
        const span = this.renderer.createElement('span');
        const tab = this.renderer.createText('\t');
        this.renderer.addClass(span, 'tab');
        this.renderer.appendChild(span, tab);
        this.renderer.appendChild(line, span);
    }
}
