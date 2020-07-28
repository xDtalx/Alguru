import { Component, OnInit } from '@angular/core';

@Component({
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public ngOnInit(): void {
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
