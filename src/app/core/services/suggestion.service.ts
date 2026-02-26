import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suggestion } from '../../models/suggestion';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {

  private suggestionUrl = 'http://localhost:3000/suggestions';

  constructor(private http: HttpClient) {}

  getSuggestionsList(): Observable<Suggestion[]> {
    return this.http.get<Suggestion[]>(this.suggestionUrl);
  }

  getSuggestionById(id: number): Observable<Suggestion> {
    return this.http.get<Suggestion>(`${this.suggestionUrl}/${id}`);
  }

  deleteSuggestion(id: number): Observable<any> {
    return this.http.delete(`${this.suggestionUrl}/${id}`);
  }

  updateLikes(id: number, nbLikes: number): Observable<any> {
    return this.http.patch(`${this.suggestionUrl}/${id}`, { nbLikes });
  }

  addSuggestion(data: any): Observable<any> {
    return this.http.post(this.suggestionUrl, data);
  }

  updateSuggestion(id: number, data: any): Observable<any> {
    return this.http.put(`${this.suggestionUrl}/${id}`, data);
  }
}