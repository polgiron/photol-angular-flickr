import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PhotoService } from 'src/app/services/photo.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-photo-modal',
  templateUrl: './photo-modal.component.html',
  styleUrls: ['./photo-modal.component.scss']
})
export class PhotoModalComponent implements OnInit {
  @ViewChild('left') leftElement: ElementRef;
  @ViewChild('right') rightElement: ElementRef;
  @Input() set photo(value: any) {
    // console.log(value);

    // this.resetLastPhoto();

    this._photo = value;

    this.extendPhoto();
    this.setDialogWidth();
    this.setQueryParameter();

    this.photoService.getContext(this.photo.id).then(albums => {
      this.albums = albums;
    });
  };
  private _resizeListener: EventListener;
  private _photo: any;
  imageSrc: string;
  padding: number = 32;
  mobileBreakpoint: number = 767;
  tags: string[] = [];
  time: number;
  contrast: number;
  aperture: number;
  albums: any;

  get photo() {
    return this._photo;
  }

  constructor(
    private utils: Utils,
    private photoService: PhotoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this._resizeListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._resizeListener);
  }

  resetLastPhoto() {
    this.imageSrc = null;
  }

  setQueryParameter() {
    // changes the route without moving from the current view or
    // triggering a navigation event,
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        open: this.photo.id
      },
      queryParamsHandling: 'merge',
      // preserve the existing query params in the route
      // skipLocationChange: true
      // do not trigger navigation
    });
  }

  onWindowResize() {
    this.setDialogWidth();
  }

  setDialogWidth() {
    if (window.innerWidth < this.mobileBreakpoint) {
      return;
    }

    const oriWidth = this.photo.width_m;
    const oriHeight = this.photo.height_m;
    const rightWidth = this.rightElement.nativeElement.clientWidth;
    const maxHeight = window.innerHeight - 2 * this.padding;
    const maxWidth = window.innerWidth - 2 * this.padding - rightWidth;

    let newWidth = oriWidth * maxHeight / oriHeight;
    let newHeight = maxHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = oriHeight * newWidth / oriWidth;
    }

    this.leftElement.nativeElement.style.width = newWidth + 'px';
    this.leftElement.nativeElement.style.height = newHeight + 'px';
  }

  extendPhoto() {
    // Image src
    this.imageSrc = this.utils.getPhotoUrl(this.photo.farm, this.photo.server, this.photo.id, this.photo.secret, 'b');

    // Extend tags
    this.photo.tags.split(' ').forEach(tag => {
      if (tag.includes('settingtime')) {
        this.time = tag.replace('settingtime', '');
      } else if (tag.includes('settingaperture')) {
        this.aperture = tag.replace('settingaperture', '');
      } else if (tag.includes('settingcontrast')) {
        this.contrast = tag.replace('settingcontrast', '');
      } else {
        this.tags.push(tag);
      }
    });
  }

  onClickNext() {
    this.photoService.goNextModal();
  }

  onClickPrev() {
    this.photoService.goPrevModal();
  }

  close() {
    this.photoService.closePhotoModal();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this._resizeListener);
    this.utils.clearOpenQuery();
  }
}
