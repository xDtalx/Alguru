import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';

const BACKEND_URL = `${environment.apiUrl}/image`;
const UPLOAD_URL = BACKEND_URL + '/upload';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('selectFile', { read: ElementRef }) selectFile: ElementRef;
  @ViewChild('uploadImageForm', { read: ElementRef }) uploadImageForm: ElementRef;

  public username = '';
  public profileImageURL: string;
  public tmpProfileImageURL: string | ArrayBuffer;
  public solvedQuestions = 0;
  public contribPoints = 0;
  public contribProblems = 0;
  public contribComments = 0;
  public showUploadForm = false;
  public cropPopupOpen = false;
  public isLoading = false;
  public uploadURL = UPLOAD_URL;
  private timestamp: string;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = this.profileService.getURLUpdatedListener().subscribe(this.onUploaded.bind(this));

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('username')) {
        this.username = paramMap.get('username');
      }
    });

    this.profileImageURL = `${BACKEND_URL}/${this.authService.getUsername()}`;
  }

  onImageURLBroken() {
    this.profileImageURL = null;
  }

  onSelectFileClick() {
    this.selectFile.nativeElement.click();
  }

  submit(event) {
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

  closeCropPopup() {
    this.isLoading = false;
    this.cropPopupOpen = false;
  }

  openCropPopup() {
    this.isLoading = true;
    this.cropPopupOpen = true;
  }

  onCropBtnClick() {
    this.isLoading = true;
  }

  onUploaded(url) {
    this.timestamp = new Date().getTime().toString();
    this.profileImageURL = `${url}?${this.timestamp}`;
    console.log(this.profileImageURL);
    this.closeCropPopup();
  }
}
