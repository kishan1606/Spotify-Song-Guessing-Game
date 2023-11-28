import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { PreferenceService } from "../../services/preference.service";
import { Router } from "@angular/router";

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token";
const TOKEN_KEY = "whos-who-access-token";

  // Token class
// const AUTH_ENDPOINT =
//   "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
// const TOKEN_KEY = "whos-who-access-token";

 // Token #1 val
// const CLIENT_ID = "";
// const CLIENT_SECRET = "";

 // Token #2 kp
const CLIENT_ID = "";
const CLIENT_SECRET = "";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  configForm: FormGroup = this.fb.group({
    genre: ["", Validators.required],
    numSongs: [1, Validators.required],
    numberOfArtists: [2, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private preferenceService: PreferenceService,
    private router: Router,
    private http: HttpClient
  ) {}

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B"];
  selectedGenre: String = "";
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";

  isLoading: boolean = false;

  // onGenreSelect(genre: string) {
  //   this.selectedGenre = genre; // Update selectedGenre when a genre is selected
  // }

  ngOnInit(): void {
    // if (this.selectedGenre) {
    //   this.configForm.patchValue({ genre: this.selectedGenre });
    // }
    this.authLoading = true;

    this.selectedGenre = this.preferenceService.getGenre();
    this.configForm.patchValue({
      genre: this.selectedGenre,
      numSongs: this.preferenceService.getNumberOfSongs(),
      numberOfArtists: this.preferenceService.getNumberOfArtists(),
    });
    

    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage : ");
        this.authLoading = false;
        this.token = storedToken.value;
        this.loadGenres(storedToken.value);
        return;
      }
    }
    console.log("Sending request to Spotify token endpoint");
    const headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    const body = new HttpParams()
      .set("grant_type", "client_credentials")
      .set("client_id", CLIENT_ID)
      .set("client_secret", CLIENT_SECRET);

    this.http.post<any>(AUTH_ENDPOINT, body.toString(), { headers }).subscribe({
      next: (data) => {
        console.log("Spotify Access Token:", data.access_token);
        const newToken = {
          value: data.access_token,
          expiration: Date.now() + (data.expires_in - 20) * 1000,
        };

        localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
        this.authLoading = false;
        this.token = data.access_token;
        this.loadGenres(data.access_token);
      },
      error: (error) => {
        console.error("Error obtaining Spotify access token:", error);
        this.authLoading = false;
      },
    });

    // console.log("Sending request to AWS endpoint");
    // request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
    //   const newToken = {
    //     value: access_token,
    //     expiration: Date.now() + (expires_in - 20) * 1000,
    //   };
    //   localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
    //   this.authLoading = false;
    //   this.token = newToken.value;
    //   this.loadGenres(newToken.value);
    // });
  }

  loadGenres = async (t: any) => {
    this.configLoading = true;
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    console.log(response);
    this.genres = response.genres;
    this.configLoading = false;
  };

  handlePlay(): void {
    this.isLoading = true;

    const formValues = this.configForm.value;
    this.preferenceService.setGenre(formValues.genre);
    this.preferenceService.setNumberOfSongs(formValues.numSongs);
    this.preferenceService.setNumberOfArtists(formValues.numberOfArtists);
    console.log("Form values:", formValues);

    this.playQuiz(); //play quiz metod to fetch data

    
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigateByUrl("/game");
    }, 2000);
  }

  private async playQuiz(): Promise<void> {
    const { artists, correctIdx } = await this.getArtists();

    if (artists.length > 0) {
      await this.getSongs(artists, correctIdx);
    } else {
      console.error("No artists found for the quiz.");
    }
  }

  async getSongs(artists: any[], correctIdx: number): Promise<void> {
    let tracks: any[]; //initialize variable to store fetch track
    try {
      const response = await fetchFromSpotify({
        //fetch top tracks for specific artist
        token: this.token,
        endpoint: `artists/${artists[correctIdx].id}/top-tracks?market=US`,
      });

      tracks = response.tracks.filter((x: any) => x.preview_url !== null); //filter track that have empty previewURL
      tracks = tracks.slice(0, this.configForm.value.numSongs); //take numsongs amount of tracks from list

      if (tracks.length < this.configForm.value.numSongs) {
        //check number of tracks of given artist if less than given number update index
        const newCorrectIdx = Math.floor(
          Math.random() * this.configForm.value.numberOfArtists
        );

        this.preferenceService.setCorrectGuess(artists[newCorrectIdx].name);
        console.log(
          "setCorrectGuess called with:",
          artists[newCorrectIdx].name
        );

        await this.getSongs(artists, newCorrectIdx);
      }

      this.preferenceService.setSongs(tracks); //set tracks to service
      console.log("setSongs called with:", tracks);
    } catch (error) {
      console.error("Error getting songs:", error); //check for error if any
    }
  }

  async getArtists(): Promise<{ artists: any[]; correctIdx: number }> {
    let tracks: any[] = []; //initialize array to store fetch track

    while (tracks.length < this.configForm.value.numberOfArtists) {
      //loop through the tracks to get desired number of artists
      try {
        const response = await fetchFromSpotify({
          token: this.token,
          endpoint: `recommendations?limit=${
            this.configForm.value.numberOfArtists * 5
          }&market=US&seed_genres=${this.configForm.value.genre}`,
        });

        tracks = response.tracks.filter((x: any) => x.preview_url !== null); //filter track that have empty previewURL
      } catch (error) {
        console.error("Error getting artists:", error);
      }
    }

    const artists: any[] = []; //initialize the array to store artists

    for (const x of tracks.slice(0, this.configForm.value.numberOfArtists)) {
      //map the tracks to an array of artistsname and id

      artists.push({
        name: x.artists[0].name,
        id: x.artists[0].id,
        image: x.album.images[0].url,
      });
      console.log(artists[0].image);
    }

    const correctIdx = Math.floor(
      //generate a random correct index from the array of artists
      Math.random() * this.configForm.value.numberOfArtists
    );

    this.preferenceService.setArtists(artists); //set the artist array
    console.log("setArtists called with:", artists);

    this.preferenceService.setCorrectGuess(artists[correctIdx].name); //set the correct guess based on randomly selected index
    console.log("setCorrectGuess called with:", artists[correctIdx].name);

    return { artists, correctIdx }; //return object with artist and correct index
  }
}
