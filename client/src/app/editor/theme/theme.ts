export interface Theme {
  name: string;
  properties;
}

export const dark: Theme = {
  name: 'dark',
  properties: {
    '--site-background': 'rgb(53, 58, 66)',
    '--site-background-img': 'none',
    '--editor-background': 'rgb(80, 80, 94)',
    '--text-color': 'rgba(255, 255, 255, 0.959)',
    '--editor-border': '1px solid rgba(0,0,0,0.2)',
    '--main-display': 'flex',
    '--caret-color': 'white',
    '--line-focus-bg-color': 'rgba(0, 0, 0, 0.020)',
    '--line-focus-border': '1px solid rgba(0, 0, 0, 0.15)',
    '--main-padding': 'none',
    '--main-background-color': 'rgb(53, 58, 66)'
  }
};

export const light: Theme = {
  name: 'light',
  properties: {
    '--site-background': 'white',
    '--site-background-img': 'none',
    '--editor-background': 'white',
    '--text-color': 'rgba(0, 0, 0, 0.959)',
    '--editor-border': '1px solid rgba(0,0,0,0.2)',
    '--main-display': 'flex',
    '--caret-color': 'black',
    '--line-focus-bg-color': 'rgba(0, 0, 0, 0.01)',
    '--line-focus-border': '1px solid rgba(0, 0, 0, 0.1)',
    '--access-modifier-color': '',
    '--main-padding': 'none',
    '--main-background-color': 'white'
  }
};
