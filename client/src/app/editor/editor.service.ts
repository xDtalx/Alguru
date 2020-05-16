import { Injectable, ElementRef, Renderer2, RendererFactory2  } from '@angular/core';

export enum ChildPosition {
    First,
    Last
}

export enum EventType {
    KeyUp = "keyup",
    KeyDown = "keydown",
    KeyPressed = "keypressed",
    MouseDown = "mousedown",
    MouseUp = "mouseup",
    Click = "click",
    Input = "input"
}

@Injectable({ providedIn: 'root' })
export class EditorService {
    private renderer: Renderer2;
    private defaultCssId: string = 'theme';
    private stringBuilder = [];
    private eventsCallbacks: Map<ElementRef, Map<string, ((event: Event) => void)[]>> = new Map<ElementRef, Map<string, ((event: Event) => void)[]>>();

    constructor(private rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    addEventHandler(element: ElementRef, eventType: EventType, callback: (event: Event) => void): void {
        if(this.eventsCallbacks.get(element)) {
            const eventHandlers = this.eventsCallbacks.get(element);
            const callbacks = eventHandlers.get(eventType);

            if(callbacks) {
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

        if(eventHandlers) {
            const callBacks = eventHandlers.get(event.type);
            
            if(callBacks) {
                callBacks.forEach(callback => {
                    callback(event);
                });
            }
        }
    }

    applyCapsLock(event): string {
        let input = String.fromCharCode(event.keyCode);

        if(/[ a-zA-Z ]/.test(input)) {
            if(!event.getModifierState('CapsLock')) {
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

        while(anchorNode && anchorNode.previousSibling && nodeTypeCheck) {
            anchorNode = anchorNode.previousSibling;
            nodeTypeCheck = nodeToLook.toLowerCase() === 'text' ? 
        anchorNode.nodeType !== Node.TEXT_NODE : anchorNode.nodeName.toLowerCase() !== nodeToLook.toLowerCase();
        }

        return anchorNode;
    }

    findElement(parent: Node, elementType: string, position: ChildPosition): HTMLElement {
        const children: NodeListOf<ChildNode> = parent.childNodes;
        let child;

        if(children) {
            const length = children.length;

            for(let i = 0; i < length; i++) {
                if(children[i].nodeName.toLowerCase() === elementType.toLowerCase()) {
                    child = children[i];

                    if(position == ChildPosition.First) {
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

        if(setCaretIn) {
            const sel = document.getSelection();
            const range = sel.getRangeAt(0);
            range.setStart(newLine, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range)
        }

        return newLine;
    }

    appendText(line: HTMLDivElement, text?: string): void {
        let newText: HTMLElement;

        if(text) {
            newText = this.renderer.createText(text);
        } else if(this.stringBuilder.length > 0) {
            const str = this.stringBuilder.join("");
            newText = this.renderer.createText(str);
        }

        if(this.stringBuilder.length > 0) {
            this.removeBR(line);
            this.renderer.appendChild(line, newText);
            this.stringBuilder = [];
        }
    }

    removeBR(line: HTMLDivElement) {
        const br = this.findElement(line, 'br', ChildPosition.First);

        if(br) {
            this.renderer.removeChild(line, br);
        }
    }

    buildString(char): void {
        this.stringBuilder.push(char);
    }

    appendTab(line: HTMLDivElement): void {
        const lastSpan = this.findElement(line, 'span', ChildPosition.Last);

        if(lastSpan) {
            if(lastSpan.nextSibling && lastSpan.nextSibling.nodeType === Node.TEXT_NODE) {
                this.createSpanWithTab(line);
            } else {
                this.removeBR(line);
                const tab = this.renderer.createText('\t');
                this.renderer.appendChild(lastSpan, tab);
            }
        } else {
            this.createSpanWithTab(line);
        }
    }

    createSpanWithTab(line: HTMLDivElement): void {
        this.removeBR(line);
        const span = this.renderer.createElement('span');
        const tab = this.renderer.createText('\t');
        this.renderer.addClass(span, 'tab');
        this.renderer.appendChild(span, tab);
        this.renderer.appendChild(line, span);
    }
}