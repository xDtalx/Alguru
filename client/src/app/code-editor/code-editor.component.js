function handleDeleteTab(event) {
    const anchorNode = document.getSelection().anchorNode;
    let nodeToTraverse = anchorNode.nodeType === Node.ELEMENT_NODE || anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentNode : anchorNode;
    const childNodesLength = nodeToTraverse.childNodes.length;

    if(anchorNode) {
        if(anchorNode.nodeName.toLowerCase() === 'div') {
            nodeToTraverse = anchorNode;
        }

        for(let i = 0; i < childNodesLength; i++) {
            let childNode = nodeToTraverse.childNodes[i];

            if(childNode && childNode.nodeName.toLowerCase() == 'span') {
                nodeToTraverse.removeChild(childNode);
                break;
            }
        }
    }

    event.preventDefault();
}

function handleInsertTab(event) {
    initViewLineForFirstInput(event, "");

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    range.collapse(true);
    const span = document.createElement('span');
    span.appendChild(document.createTextNode('\t'));
    span.style.whiteSpace = 'pre';
    range.insertNode(span);
    // Move the caret immediately after the inserted span
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    event.preventDefault();
}

function handleKeyDown(event) {
    let input = String.fromCharCode(event.keyCode);

    if(!event.getModifierState('CapsLock')) {
        input = input.toLowerCase();
    }

    if (event.keyCode === 9 && event.shiftKey) {
        handleDeleteTab(event);
    } else if(event.keyCode === 9) {
        handleInsertTab(event);
    } else if(/[a-zA-Z0-9-_@#$%^&*=()!~`:;"',\./?<>}{} ]/.test(input)) {
        initViewLineForFirstInput(event, input);
    }
}

function initViewLineForFirstInput(event, input) {
    const anchorNode = document.getSelection().anchorNode;

    if(anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE && anchorNode.classList.contains('editor')) {
        const viewLine = document.createElement('div');
        viewLine.classList.add('view-line');
        const text = document.createTextNode(input);
        viewLine.appendChild(text);
        anchorNode.appendChild(viewLine);
        const range = new Range();
        range.setStartAfter(text);
        range.collapse(true);
        const sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        event.preventDefault();
    }
}

function addClassToNewLineDiv(id) {
    let editor = document.getElementById(id);
    editor.childNodes.forEach(element => {
        if(element.nodeName.toLowerCase() === 'div') {
            element.classList.add('view-line');
        }
    });
}
