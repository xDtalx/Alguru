import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme/theme.service';
import { ProfileService } from './profile.service';
import { IUserStats } from './user-stats.model';

const BACKEND_URL = `${environment.apiUrl}/image`;
const UPLOAD_URL = BACKEND_URL + '/upload';

@Component({
  selector: 'app-profile',
  styleUrls: ['./profile.component.css'],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('selectFile', { read: ElementRef }) public selectFile: ElementRef;
  @ViewChild('uploadImageForm', { read: ElementRef }) public uploadImageForm: ElementRef;

  public solvedQuestions = 0;
  public username = '';
  public profileImageURL: string;
  public tmpProfileImageURL: string | ArrayBuffer;
  public stats: IUserStats;
  public showUploadForm = false;
  public cropPopupOpen = false;
  public isLoading = false;
  public uploadURL = UPLOAD_URL;
  public showChangeImageBtn = false;
  private timestamp: string;
  private urlUpdatedSub: Subscription;
  private statsUpdatedSub: Subscription;
  private routeSub: Subscription;
  private theme = 'dark';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.urlUpdatedSub = this.profileService.getURLUpdatedListener().subscribe(this.onUploaded.bind(this));
    this.statsUpdatedSub = this.profileService.getStatsUpdatedListener().subscribe((stats) => {
      this.stats = stats;
      this.solvedQuestions = Object.keys(this.stats.solvedQuestions).length;
    });
    this.routeSub = this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('username')) {
        this.username = paramMap.get('username');
        this.showChangeImageBtn = this.username === this.authService.getUsername();
        this.profileImageURL = `${BACKEND_URL}/${this.username}`;
      }
    });
  }

  public ngAfterViewInit(): void {
    document.documentElement.style.setProperty('--site-background-img', 'none');
  }

  public ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.urlUpdatedSub.unsubscribe();
    this.statsUpdatedSub.unsubscribe();
    this.urlUpdatedSub.unsubscribe();
    this.themeService.reset();
  }

  public ngOnInit(): void {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.overrideProperty(
      '--site-background-img',
      'url("assets/home-page/homePageBackground.png") no-repeat'
    );
    this.themeService.overrideProperty('--main-padding', '3rem 0 0 0');
    this.themeService.setActiveThemeByName(this.theme);
    this.profileService.updateSolvedQuestions();
  }

  public onImageURLBroken(): void {
    this.profileImageURL = null;
  }

  public onSelectFileClick(): void {
    this.selectFile.nativeElement.click();
  }

  public submit(event): void {
    this.openCropPopup();

    if (!event.target || !event.target.files || event.target.files.length !== 1) {
      return;
    }

    const file = event.target.files[0];

    if (
      file.type !== 'image/jpeg' &&
      file.type !== 'image/png' &&
      file.type !== 'image/gif' &&
      file.type !== 'image/jpg'
    ) {
      return;
    }

    const fr = new FileReader();

    fr.onloadend = () => (this.tmpProfileImageURL = fr.result);
    fr.readAsDataURL(file);
    this.isLoading = false;
  }

  public closeCropPopup(): void {
    this.isLoading = false;
    this.cropPopupOpen = false;
  }

  public openCropPopup(): void {
    this.isLoading = true;
    this.cropPopupOpen = true;
  }

  public onCropBtnClick(): void {
    this.isLoading = true;
  }

  public onUploaded(url): void {
    this.timestamp = new Date().getTime().toString();
    this.profileImageURL = `${url}?${this.timestamp}`;
    this.closeCropPopup();
  }

  public getSolvedQuestions(): number {
    return this.stats ? this.stats.solvedQuestions.size : 0;
  }
}
