import { AfterViewChecked, Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements DoCheck {
  public hideFooter = false;

  constructor(private route: Router) {}

  public ngDoCheck(): void {
    this.hideFooter = this.route.url.indexOf('solve') !== -1;
  }
}
