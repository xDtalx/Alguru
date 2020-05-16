import { Injectable } from '@angular/core';
import { Theme, light, dark } from './theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme = light;
  private availableThemes: Theme[] = [light, dark];
  private initialProperties: Map<string, string>;

  getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  getActiveTheme(): Theme {
    return this.active;
  }

  isDarkTheme(): boolean {
    return this.active.name === dark.name;
  }

  setDarkTheme(): void {
    this.setActiveTheme(dark);
  }

  setLightTheme(): void {
    this.setActiveTheme(light);
  }

  setActiveTheme(theme: Theme): void {
    const saveInitialProperties = !this.initialProperties;
    this.active = theme;

    if(saveInitialProperties) {
      this.initialProperties = new Map<string, string>();
    }

    Object.keys(this.active.properties).forEach(property => {
      if(saveInitialProperties) {
        const prevValue: string = document.documentElement.style.getPropertyValue(property);

        if(prevValue) {
          this.initialProperties.set(property, prevValue);
        }
      }

      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });
  }

  reset() {
    Object.keys(this.active.properties).forEach(property => {
      const prevValue: string = this.initialProperties.get(property);

      if(prevValue) {
        document.documentElement.style.setProperty(property, prevValue);
      }
    });
  }

  setActiveThemeByName(name: string) {
    const availables: Theme[] = this.getAvailableThemes();
    const count = availables.length;

    for(let i = 0; i < count; i++) {
      if(availables[i].name === name) {
        this.setActiveTheme(availables[i]);
        break;
      }
    }
  }
}
