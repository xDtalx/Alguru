export interface Theme {
  name: string;
  properties;
}

export const dark: Theme = {
  name: 'dark',
  properties: {
    '--caret-color': 'white',
    '--editor-background': 'rgb(80, 80, 94)',
    '--editor-border': '1px solid rgba(0,0,0,0.2)',
    '--line-focus-bg-color': 'rgba(0, 0, 0, 0.020)',
    '--line-focus-border': '1px solid rgba(0, 0, 0, 0.15)',
    '--line-focus-border-color': 'rgba(255, 255, 255, 0.15)',
    '--main-background-color': 'rgb(53, 58, 66)',
    '--main-display': 'flex',
    '--main-padding': 'none',
    '--primary-btn-bg-color': 'rgba(255, 255, 255, 0.1)',
    '--primary-btn-border': '1px solid rgba(255, 255, 255, 0.1)',
    '--primary-btn-color': 'rgba(255, 255, 255, 0.9',
    '--site-background': 'rgb(53, 58, 66)',
    '--site-background-img': 'none',
    '--text-color': 'rgba(255, 255, 255, 0.959)'
  }
};

export const light: Theme = {
  name: 'light',
  properties: {
    '--access-modifier-color': '',
    '--caret-color': 'black',
    '--editor-background': 'white',
    '--editor-border': '1px solid rgba(0,0,0,0.2)',
    '--line-focus-bg-color': 'rgba(0, 0, 0, 0.01)',
    '--line-focus-border': '1px solid rgba(0, 0, 0, 0.1)',
    '--line-focus-border-color': 'rgba(255, 255, 255, 0.15)',
    '--main-background-color': 'white',
    '--main-display': 'flex',
    '--main-padding': 'none',
    '--site-background': 'white',
    '--site-background-img': 'none',
    '--text-color': 'rgba(0, 0, 0, 0.959)'
  }
};
