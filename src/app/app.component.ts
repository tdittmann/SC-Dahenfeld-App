import {Component, ViewChild} from "@angular/core";
import {Nav, Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {NavigationItem} from "../entities/NavigationItem";
import {OldiesComponent} from "../pages/oldies/oldies.component";
import {CalendarComponent} from "../pages/calendar/calendar.component";
import {AboutComponent} from "../pages/about/about.component";
import {ArticleDetailLeadImageComponent} from "../pages/articleDetail/leadImage/articleDetailLeadImage.component";
import {TeamDetailComponent} from "../pages/teamDetail/teamDetail.component";
import {Mannschaftsart} from "../entities/Mannschaftsart";
import {TourComponent} from "../pages/tour/tour.component";
import {environment} from "../environments/environment";
import {YouthComponent} from "../pages/youth/youth.component";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import {BirthdaysComponent} from "../pages/birthdays/birthdays.component";
import {FrontPageComponent} from "../pages/frontPage/frontPage.component";
import {ArticleDetailCardComponent} from "../pages/articleDetail/card/articleDetailCard.component";
import {HttpClient} from "@angular/common/http";
import {Storage} from "@ionic/storage";
import {DevModeService} from "../services/devMode.service";
import {ProfileComponent} from "../pages/profile/profile.component";
import {BlogComponent} from "../pages/blog/blog.component";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: any = FrontPageComponent;

  /* NAVIGATION */
  vereinNavigation: NavigationItem[] = [
    {title: 'News', component: FrontPageComponent, icon: "paper", active: true},
    {
      title: 'Chronik',
      component: BlogComponent,
      heading: "Chronik",
      icon: "time",
      parameter: {heading: 'Chronik', categoryId: 155, showDate: false}
    },
    {title: 'Kalender', component: CalendarComponent, icon: "calendar"},
    {title: 'Sportheim', component: ArticleDetailCardComponent, parameter: "830", icon: "restaurant"},
  ];
  fussballNavigation: NavigationItem[] = [
    {
      title: '1. Mannschaft',
      component: TeamDetailComponent,
      parameter: Mannschaftsart.ERSTE_MANNSCHAFT,
      icon: "football"
    },
    {
      title: '2. Mannschaft',
      component: TeamDetailComponent,
      parameter: Mannschaftsart.ZWEITE_MANNSCHAFT,
      icon: "football"
    },
    {
      title: 'Alte Herren',
      component: BlogComponent,
      icon: "football",
      parameter: {heading: 'Alte Herren', categoryId: 109, showDate: true}
    },
    {title: 'Jugend', component: YouthComponent, icon: "football"},
  ];
  turnenTischtennisNavigation: NavigationItem[] = [
    {title: 'Turnen', component: ArticleDetailLeadImageComponent, parameter: "733", icon: "body"},
    {title: 'Tischtennis', component: ArticleDetailLeadImageComponent, parameter: "755", icon: "walk"},
  ];
  developmentNavigation: NavigationItem[] = [
    {title: 'Geburtstage', component: BirthdaysComponent, icon: "time"},
    {title: 'Profil', component: ProfileComponent, icon: "person"},
  ];
  appNavigation: NavigationItem[] = [
    {title: 'Datenschutz', component: ArticleDetailCardComponent, parameter: "1195", icon: "finger-print"},
    {title: 'Impressum', component: AboutComponent, icon: "information-circle"}
  ];

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
              private push: Push, private storage: Storage, private http: HttpClient,
              private devModeService: DevModeService) {
    platform.ready().then(() => {

      // Check if tour already showed
      this.storage.get("tour").then(
        (tourDone) => {
          if (!tourDone) {
            this.rootPage = TourComponent;
          }
        }
      );

      // Load devMode in service
      this.devModeService.loadDevModeFromDb();

      // Push Notifications
      this.handlePush();

      statusBar.styleDefault();
      statusBar.styleLightContent();
      splashScreen.hide();
    });
  }

  openPage(page: NavigationItem) {
    this.resetPageActiveStates();

    page.active = true;
    this.nav.setRoot(page.component, {parameter: page.parameter, heading: page.heading});
  }

  isDevModeEnabled() {
    return this.devModeService.isDevModeEnabled();
  }

  private resetPageActiveStates() {
    this.resetPageActiveState(this.vereinNavigation);
    this.resetPageActiveState(this.fussballNavigation);
    this.resetPageActiveState(this.turnenTischtennisNavigation);
    this.resetPageActiveState(this.developmentNavigation);
    this.resetPageActiveState(this.appNavigation);
  }

  private resetPageActiveState(navigationItems: NavigationItem[]) {
    for (let navigationItem of navigationItems) {
      navigationItem.active = false;
    }
  }

  private handlePush() {

    // Init the push service
    const pushOptions: PushOptions = {
      android: {
        forceShow: "true",
        senderID: ''
      },
      ios: {
        alert: "true",
        badge: "true",
        sound: "true"
      },
      windows: {}
    };

    // Check if we have permission
    this.push.hasPermission()
      .then((res: any) => {
        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
        } else {
          console.warn('We do not have permission to send push notifications');
        }
      });

    const pushObject: PushObject = this.push.init(pushOptions);

    // Registration
    pushObject.on('registration').subscribe(
      (registration: any) => {
        this.saveToken(registration.registrationId);
        console.log('Token saved:', registration.registrationId);
      },
      (error) => {
        console.error(error);
      });

    // Notification
    pushObject.on('notification').subscribe(
      (notification: any) => {
        console.log('Received a notification', notification);

        if (notification.additionalData.page == "newsDetail") {
          this.nav.setRoot(ArticleDetailLeadImageComponent, {parameter: notification.additionalData.id});
        } else if (notification.additionalData.page == "vereinskalender") {
          this.nav.setRoot(CalendarComponent);
        } else {
          this.nav.setRoot(FrontPageComponent);
        }
      });

    // Error
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

  private saveToken(token: string) {
    let os: string = this.getOperationSystem();

    // Save in backend
    this.http.get(environment.backendUrl + "settings?registrationId=" + token + "&os=" + os)
      .subscribe(
        (result) => {
          console.log("Registration done: " + result);
        }
      );

    // Save in local storage
    this.storage.set("pushToken", token).then(
      (result) => {
        console.log("Push token saved in local storage: " + result);
      },
      (error) => {
        console.error("Saving token failed: " + error);
      }
    )
  }

  /**
   *   We only provide android and ios, so if no android device it is automatically an ios-device.
   */
  private getOperationSystem(): string {
    if (navigator.userAgent.match(/Android/i)) {
      return "android";
    }

    return "ios";
  }
}

