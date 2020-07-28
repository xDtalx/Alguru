import { Injectable } from '@angular/core';
import { dark, light, Theme } from './theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme = light;
  private availableThemes: Theme[] = [light, dark];
  private previousProperties: Map<string, string>;
  private propToOverride: Map<string, string> = new Map<string, string>();

  public overrideProperty(propName: string, propVal: string) {
    this.propToOverride.set(propName, propVal);
  }

  public getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  public getActiveTheme(): Theme {
    return this.active;
  }

  public isDarkTheme(): boolean {
    return this.active.name === dark.name;
  }

  public setDarkTheme(): void {
    this.setActiveTheme(dark);
  }

  public setLightTheme(): void {
    this.setActiveTheme(light);
  }

  public setActiveTheme(theme: Theme): void {
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
      if (this.propToOverride.get(property)) {
        document.documentElement.style.setProperty(property, this.propToOverride.get(property));
      } else {
        document.documentElement.style.setProperty(property, this.active.properties[property]);
      }
    });
  }

  public reset() {
    Object.keys(this.active.properties).forEach((property) => {
      if (document.documentElement.style.getPropertyValue(property)) {
        document.documentElement.style.removeProperty(property);
      }
    });

    this.previousProperties.forEach((value, key) => {
      document.documentElement.style.setProperty(key, value);
    });

    this.propToOverride.clear();
  }

  public setActiveThemeByName(name: string) {
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
