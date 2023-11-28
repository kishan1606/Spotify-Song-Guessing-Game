import { Component, OnInit } from "@angular/core";
import { Howl } from "howler";
import { PreferenceService } from "../../services/preference.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit {
  songs: any[] = [];
  artists: any[] = [];
  feedback: string = "";
  correctArtist: string = "";
  hasGuessed: boolean = false;
  isCorrectGuess: boolean = false;

  constructor(
    private preferenceService: PreferenceService,
    private router: Router
  ) {}

  ngOnInit() {
    const hasLoadedFlag = sessionStorage.getItem('hasLoadedFlag');

    if (!hasLoadedFlag) { //use session storage for refresh page occurance
      sessionStorage.setItem('hasLoadedFlag', 'true');
      this.loadGame();
    }else if (this.preferenceService.getPreferences().genre) {
      this.loadGame();
    } else {
      this.goToHome();
    }
  }

  loadGame() {
    const preferences = this.preferenceService.getPreferences();
    this.songs = preferences.songs;
    this.artists = preferences.artists;
    this.correctArtist = preferences.correctGuess;

    console.log(this.songs);
    console.log(this.artists);
    console.log(this.correctArtist);
  }

  playSong(previewUrl: string) {
    const sound = new Howl({
      src: [previewUrl],
      autoplay: true,
      mute: true, // try with mute initially
    });
    sound.play();
    console.log("url :  " + previewUrl);
  }

  makeGuess(artistName: string) {
    if (!this.hasGuessed) {
      this.hasGuessed = true;
      if (artistName === this.correctArtist) {
        this.feedback = "Correct";
        this.isCorrectGuess = true;
      } else {
        this.feedback = "Incorrect";
        this.isCorrectGuess = false;
      }
    }
  }

  getFeedbackClass(): string {
    if (this.feedback === "Correct") {
      return 'correct';
    } else if (this.feedback === "Incorrect") {
      return 'incorrect';
    }
    return '';
  }


  goToHome() {
    this.router.navigate([""]);
  }
}
