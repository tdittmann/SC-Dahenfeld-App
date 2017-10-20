import {Component, Input} from "@angular/core";
import {PhotoViewer} from "@ionic-native/photo-viewer";

@Component({
  selector: "leadimage",
  templateUrl: "leadimage.component.html"
})
export class LeadImageComponent {

  @Input('src') imageSrc: string = "";

  constructor(private photoViewer: PhotoViewer) {

  }

  openImageInViewer(): void {
    this.photoViewer.show(this.imageSrc.match(/"(.*?)"/)[1], "", {share: false});
  }

}