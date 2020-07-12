import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('selectFile', { read: ElementRef }) selectFile: ElementRef;
  @ViewChild('uploadImageForm', { read: ElementRef }) uploadImageForm: ElementRef;

  public username = '';
  public profileImageURL: string;
  public solvedQuestions = 0;
  public contribPoints = 0;
  public contribProblems = 0;
  public contribComments = 0;
  public showUploadForm = false;

  constructor(private route: ActivatedRoute, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('username')) {
        this.username = paramMap.get('username');
      }
    });
  }

  onSelectFileClick() {
    this.selectFile.nativeElement.click();
  }

  submit(event) {
    if (event.target.files.length > 0) {
      this.profileService.uploadImage(event.target.files[0]);
    }
  }
}
