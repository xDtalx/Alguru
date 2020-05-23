export interface Theme {
    name: string;
    properties: object;
}

export const dark: Theme = {
    name: 'dark',
    properties: {
        '--site-background': 'rgb(53, 58, 66)',
        '--editor-background': 'rgb(80, 80, 94)',
        '--text-color': 'rgba(255, 255, 255, 0.959)',
        '--editor-border': '1px solid rgba(0,0,0,0.3)',
        '--main-display': 'flex',
        '--main-width': '100vw',
        '--caret-color': 'white',
        '--access-modifier-color': ''
    }
};

export const light: Theme = {
    name: 'light',
    properties: {
        '--site-background': 'white',
        '--editor-background': 'rgb(80, 80, 94)',
        '--text-color': 'rgba(255, 255, 255, 0.959)',
        '--editor-border': '1px solid rgba(0,0,0,0.3)',
        '--main-display': 'flex',
        '--main-width': '100vw',
        '--caret-color': 'black',
        '--access-modifier-color': ''
    }
};
