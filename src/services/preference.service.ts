import { Injectable } from "@angular/core";

interface UserPreferences {
  genre: string;
  numberOfSongs: number;
  numberOfArtists: number;
  artists: any[];
  songs: any[];
  correctGuess: string;
}

@Injectable({
  providedIn: "root",
})
export class PreferenceService {
  private preferences: UserPreferences = {
    genre: "",
    numberOfSongs: 1,
    numberOfArtists: 2,
    artists: [],
    songs: [],
    correctGuess: "",
  };

  constructor() {
    localStorage.clear();
  }

  setPreferences(preferences: UserPreferences): void {
    this.preferences = preferences;
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

  setGenre(genre: string): void {
    this.preferences.genre = genre;
    this.saveToLocalStorage();
  }

  getGenre(): string {
    return this.preferences.genre;
  }

  setNumberOfSongs(numberOfSongs: number): void {
    this.preferences.numberOfSongs = numberOfSongs;
    this.saveToLocalStorage();
  }

  getNumberOfSongs(): number {
    return this.preferences.numberOfSongs;
  }

  setNumberOfArtists(numberOfArtists: number): void {
    this.preferences.numberOfArtists = numberOfArtists;
    this.saveToLocalStorage();
  }

  getNumberOfArtists(): number {
    return this.preferences.numberOfArtists;
  }

  setArtists(artists: any[]): void {
    this.preferences.artists = artists;
    this.saveToLocalStorage();
  }

  getArtists(): any[] {
    return this.preferences.artists;
  }

  setSongs(songs: any[]): void {
    this.preferences.songs = songs;
    this.saveToLocalStorage();
  }

  getSongs(): any[] {
    return this.preferences.songs;
  }

  setCorrectGuess(correctGuess: string): void {
    this.preferences.correctGuess = correctGuess;
    this.saveToLocalStorage();
  }

  getCorrectGuess(): string {
    return this.preferences.correctGuess;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem("userPreferences", JSON.stringify(this.preferences));
  }

  private loadPreferences(): void {
    const storedPreferences = localStorage.getItem("userPreferences");
    if (storedPreferences) {
      this.preferences = JSON.parse(storedPreferences);
    }
  }
}
