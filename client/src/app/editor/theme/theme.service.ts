import { Injectable } from '@angular/core';
import { Theme, light, dark } from './theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private active: Theme = light;
  private availableThemes: Theme[] = [light, dark];
  private previousProperties: Map<string, string>;

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
    this.active = theme;

    if (!this.previousProperties) {
      this.previousProperties = new Map<string, string>();

      Object.keys(this.active.properties).forEach((property) => {
        const prevPropertyValue = document.documentElement.style.getPropertyValue(property);

        if (prevPropertyValue) {
          this.previousProperties.set(property, prevPropertyValue);
        }
      });
    }

    Object.keys(this.active.properties).forEach((property) => {
      document.documentElement.style.setProperty(property, this.active.properties[property]);
    });
  }

  reset() {
    Object.keys(this.active.properties).forEach((property) => {
      if (document.documentElement.style.getPropertyValue(property)) {
        document.documentElement.style.removeProperty(property);
      }
    });

    this.previousProperties.forEach((value, key) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  setActiveThemeByName(name: string) {
    const availables: Theme[] = this.getAvailableThemes();
    const count = availables.length;

    for (let i = 0; i < count; i++) {
      if (availables[i].name === name) {
        this.setActiveTheme(availables[i]);
        break;
      }
    }
  }
}
