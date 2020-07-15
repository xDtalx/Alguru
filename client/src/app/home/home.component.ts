import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    document.documentElement.style.setProperty('--main-padding', 'none');
  }

  goToNext(event: MouseEvent): void {
    this.getCardTarget(event).scrollIntoView({ behavior: 'smooth' });
  }

  goToPrev(event) {
    const target = this.getCardTarget(event);

    if (target.previousElementSibling) {
      target.previousElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getCardTarget(event: MouseEvent): HTMLElement {
    let target = event.target as HTMLElement;

    while (!target.classList.contains('info-container')) {
      target = target.parentElement;
    }

    return target;
  }
}
