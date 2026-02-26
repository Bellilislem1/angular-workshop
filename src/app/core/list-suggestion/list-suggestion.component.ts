import { Component, OnInit } from '@angular/core';
import { Suggestion } from '../../models/suggestion';
import { SuggestionService } from '../../core/services/suggestion.service';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrls: ['./list-suggestion.component.css']
})
export class ListSuggestionComponent implements OnInit {
  searchTitle: string = '';
  searchCategory: string = '';
  suggestions: Suggestion[] = [];
  favorites: Suggestion[] = [];

  private readonly LS_FAVORITES = 'campusideas_favorites';

  constructor(private suggestionService: SuggestionService) {}

  ngOnInit(): void {
    this.loadSuggestions();
    this.loadFavoritesFromStorage();
  }

  loadSuggestions(): void {
    this.suggestionService.getSuggestionsList().subscribe({
      next: (data) => {
        this.suggestions = data.map(s => ({
          ...s,
          date: new Date(s.date as any) // ✅ convert string -> Date
        })) as Suggestion[];

        console.log('✅ Suggestions chargées:', this.suggestions);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
      }
    });
  }

  get filteredSuggestions(): Suggestion[] {
    const t = this.searchTitle.trim().toLowerCase();
    const c = this.searchCategory.trim().toLowerCase();

    return this.suggestions.filter(s => {
      const okTitle = !t || s.title.toLowerCase().includes(t);
      const okCat = !c || s.category.toLowerCase().includes(c);
      return okTitle && okCat;
    });
  }

  like(s: Suggestion): void {
    s.nbLikes++;
    
    this.suggestionService.updateLikes(s.id, s.nbLikes).subscribe({
      next: () => console.log('✅ Likes mis à jour'),
      error: (error) => {
        console.error('❌ Erreur:', error);
        s.nbLikes--;
      }
    });
  }

  deleteSuggestion(s: Suggestion): void {
    if (confirm(`Voulez-vous vraiment supprimer "${s.title}" ?`)) {
      this.suggestionService.deleteSuggestion(s.id).subscribe({
        next: () => {
          // ✅ enlever de la liste sans recharger
          this.suggestions = this.suggestions.filter(x => x.id !== s.id);

          // ✅ enlever des favoris aussi
          this.favorites = this.favorites.filter(f => f.id !== s.id);
          this.saveFavoritesToStorage();

          alert('✅ Suggestion supprimée');
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          alert('❌ Erreur lors de la suppression');
        }
      });
    }
  }

  addToFavorites(s: Suggestion): void {
    if (!this.isFavorite(s)) {
      this.favorites.push(s);
      this.saveFavoritesToStorage();
      alert(`"${s.title}" ajoutée aux favoris !`);
    }
  }

  isFavorite(s: Suggestion): boolean {
    return this.favorites.some(f => f.id === s.id);
  }

  removeFromFavorites(s: Suggestion): void {
    this.favorites = this.favorites.filter(f => f.id !== s.id);
    this.saveFavoritesToStorage();
  }

  private saveFavoritesToStorage(): void {
    const data = this.favorites.map(f => ({
      ...f,
      date: f.date instanceof Date ? f.date.toISOString() : f.date
    }));
    localStorage.setItem(this.LS_FAVORITES, JSON.stringify(data));
  }

  private loadFavoritesFromStorage(): void {
    const raw = localStorage.getItem(this.LS_FAVORITES);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as any[];
      this.favorites = data.map(x => ({
        ...x,
        date: new Date(x.date)
      })) as Suggestion[];
    } catch {}
  }
}