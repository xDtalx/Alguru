import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebook, faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCog, faUser } from '@fortawesome/free-solid-svg-icons';
import { CropperComponent } from '../image-cropper/image-cropper.component';
import { SharedModule } from '../notifications-shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ErrorComponent } from '../error/error.component';
import { ErrorSharedModule } from '../error/error-shared.module';

@NgModule({
  declarations: [ProfileComponent, CropperComponent],
  imports: [CommonModule, FormsModule, FontAwesomeModule, ProfileRoutingModule, SharedModule, ErrorSharedModule]
})
export class ProfileModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(faFacebook, faLinkedin, faGithub, faTwitter, faUser, faCog);
  }
}
