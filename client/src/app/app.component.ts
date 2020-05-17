import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Alguru';
  showSmallHeader: boolean;
  @ViewChild('main', {read: ElementRef}) main: ElementRef;
  @ViewChild('header', {read: ElementRef}) header: ElementRef;

  constructor(private authService: AuthService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.authService.autoAuthUser();
  }
}
