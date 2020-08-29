import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../theme/theme.service';

@Component({
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public ngOnInit(): void {
    document.documentElement.style.setProperty('--main-background-color', 'rgba(0, 0, 0, 0.05)');
    document.documentElement.style.setProperty('--main-padding', 'none');
  }

  public goToNext(event: MouseEvent): void {
    this.getCardTarget(event).scrollIntoView({ behavior: 'smooth' });
  }

  public goToPrev(event) {
    const target = this.getCardTarget(event);

    if (target.previousElementSibling) {
      target.previousElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public getCardTarget(event: MouseEvent): HTMLElement {
    let target = event.target as HTMLElement;

    while (!target.classList.contains('info-container')) {
      target = target.parentElement;
    }

    return target;
  }
}
