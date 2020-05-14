import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as $ from 'jquery';
import { range } from 'rxjs';

declare function handleKeyDown(event);
declare function addClassToNewLineDiv(id);

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: [ './code-editor.component.css' ]
})
export class CodeEditorComponent implements OnInit, OnDestroy {

    @Input() public editorId: string = 'editor';

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        document.querySelectorAll('div.editor').forEach((value, key, parent) => {
            value.addEventListener('keydown', handleKeyDown);
            value.addEventListener('input', () => addClassToNewLineDiv(this.editorId));
        });
    }
    
    getId() {
        return this.editorId;
    }
}