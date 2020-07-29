import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import Cropper from 'cropperjs';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-cropper',
  styleUrls: ['./image-cropper.component.css'],
  templateUrl: './image-cropper.component.html'
})
export class CropperComponent implements AfterViewInit {
  @ViewChild('image')
  public imageElement: ElementRef;

  // tslint:disable: no-input-rename
  @Input('src')
  public imageSource: string | ArrayBuffer;

  @Input('uploadto')
  public uploadTo: string;

  @Output()
  public cropClick = new EventEmitter<boolean>();

  public loading = true;
  public imageDestination: string;
  private cropper: Cropper;

  public constructor(private profileService: ProfileService) {
    this.imageDestination = '';
  }

  public ngAfterViewInit() {
    setTimeout(() => (this.loading = false), 150);
    setTimeout(() => {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1,
        crop: () => {
          const canvas = this.cropper.getCroppedCanvas();
          this.imageDestination = canvas.toDataURL('image/png');
        },
        scalable: false,
        zoomable: false
      });
    }, 100);
  }

  public async uploadImage() {
    this.cropClick.emit(true);

    this.cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob((blob) => {
      const formData = new FormData();
      formData.append('image', blob);
      this.profileService.uploadImage(blob);
    });
  }
}
