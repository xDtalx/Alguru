export interface Theme {
    name: string;
    properties: object;
}

export const dark: Theme = {
    name: 'dark',
    properties: {
        "--editor-background": "rgb(80, 80, 94)",
        "--text-color": "rgba(255, 255, 255, 0.959)",
        "--editor-border": "1px solid rgba(0,0,0,0.3)",
        "--main-display": "flex",
        "--main-width": "100vw"
    }
}

export const light: Theme = {
    name: 'light',
    properties: {
        "--editor-background": "rgb(80, 80, 94)",
        "--text-color": "rgba(255, 255, 255, 0.959)",
        "--editor-border": "1px solid rgba(0,0,0,0.3)",
        "--main-display": "flex",
        "--main-width": "100vw"
    }
}