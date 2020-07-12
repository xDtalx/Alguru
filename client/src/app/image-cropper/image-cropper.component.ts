import { HttpClient } from '@angular/common/http';
import {
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
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class CropperComponent {
  @ViewChild('image')
  public imageElement: ElementRef;

  @Input('src')
  public imageSource: string | ArrayBuffer;

  @Input('uploadto')
  public uploadTo: string;

  @Output('cropclick')
  public cropClick = new EventEmitter<boolean>();

  public imageDestination: string;
  private cropper: Cropper;

  public constructor(private profileService: ProfileService) {
    this.imageDestination = '';
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        zoomable: false,
        scalable: false,
        aspectRatio: 1,
        crop: () => {
          const canvas = this.cropper.getCroppedCanvas();
          this.imageDestination = canvas.toDataURL('image/png');
        }
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
