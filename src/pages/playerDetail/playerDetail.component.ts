import {Component, OnInit} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Player} from "../../entities/Player";
import {environment} from "../../environments/environment";
import {DevModeService} from "../../services/devMode.service";
import {ImageUtils} from "../../utils/ImageUtils";

@Component({
  selector: 'player-detail',
  templateUrl: 'playerDetail.component.html'
})
export class PlayerDetailComponent implements OnInit {

  player: Player;

  constructor(private navParams: NavParams, private devModeService: DevModeService) {

  }

  ngOnInit(): void {
    this.player = this.navParams.data.params;
  }

  getPlayerImage(image: string): string {
    let imagePath: string = (image) ? environment.siteUrl + '/' + image : environment.placeholderPlayer;
    return ImageUtils.createCssBackgroundImageString(imagePath);
  }

  isDevModeEnabled(): boolean {
    return this.devModeService.isDevModeEnabled();
  }
}
