import { Injectable, ElementRef } from '@angular/core';

export enum ChildPosition {
    first,
    last
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
    private defaultCssId: string = 'theme';
    private eventsCallbacks: Map<ElementRef, Map<string, ((event: Event) => void)[]>> = new Map<ElementRef, Map<string, ((event: Event) => void)[]>>();

    addEventHandler(element: ElementRef, eventType: EventType, callback: (event: Event) => void) {
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

    handleEvent(element: ElementRef, event: Event) {
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

    loadCSS(cssUrl: string, cssId: string = this.defaultCssId): void {
        this.unloadCSS(cssId)
        const newLink  = document.createElement('link');
        const head  = document.getElementsByTagName('head')[0];

        newLink.id   = cssId;
        newLink.rel  = 'stylesheet';
        newLink.type = 'text/css';
        newLink.href = cssUrl;

        head.appendChild(newLink);
    }

    unloadCSS(cssId: string = this.defaultCssId): void {
        const cssLink = document.querySelector(`head #${cssId}`);

        if(cssLink) {
            cssLink.remove();
        }
    }

    selectTheme(theme: string): void {
        switch(theme) {
            case 'dark':
                this.loadCSS('/assets/editor/editor-dark.css');
                break;
            default:
                this.loadCSS('/assets/editor/editor-default.css');
        }
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
}