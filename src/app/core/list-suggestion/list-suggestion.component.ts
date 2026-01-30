import { Component, OnInit } from '@angular/core';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrls: ['./list-suggestion.component.css']
})
export class ListSuggestionComponent implements OnInit {

  // Recherche (étape 8)
  searchTitle: string = '';
  searchCategory: string = '';

  // Données (étape 5)
  suggestions: Suggestion[] = [
    {
      id: 1,
      title: 'Organiser une journée team building',
      description: 'Suggestion pour organiser une journée de team building pour renforcer les liens entre les membres de l\'équipe.',
      category: 'Événements',
      date: new Date('2025-01-20'),
      status: 'acceptee',
      nbLikes: 10
    },
    {
      id: 2,
      title: 'Améliorer le système de réservation',
      description: 'Proposition pour améliorer la gestion des réservations en ligne avec un système de confirmation automatique.',
      category: 'Technologie',
      date: new Date('2025-01-15'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 3,
      title: 'Créer un système de récompenses',
      description: 'Mise en place d\'un programme de récompenses pour motiver les employés et reconnaître leurs efforts.',
      category: 'Ressources Humaines',
      date: new Date('2025-01-25'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 4,
      title: 'Moderniser l\'interface utilisateur',
      description: 'Refonte complète de l\'interface utilisateur pour une meilleure expérience utilisateur.',
      category: 'Technologie',
      date: new Date('2025-01-30'),
      status: 'en_attente',
      nbLikes: 0
    }
  ];

  favorites: Suggestion[] = [];

  // LocalStorage keys (simple + stable)
  private readonly LS_SUGGESTIONS = 'campusideas_suggestions';
  private readonly LS_FAVORITES = 'campusideas_favorites';

  ngOnInit(): void {
    // Charger les likes + favoris sauvegardés
    this.loadSuggestionsFromStorage();
    this.loadFavoritesFromStorage();
  }

  // ✅ Liste filtrée utilisée par ton HTML: *ngFor="let s of filteredSuggestions"
  get filteredSuggestions(): Suggestion[] {
    const t = this.searchTitle.trim().toLowerCase();
    const c = this.searchCategory.trim().toLowerCase();

    return this.suggestions.filter(s => {
      const okTitle = !t || s.title.toLowerCase().includes(t);
      const okCat = !c || s.category.toLowerCase().includes(c);
      return okTitle && okCat;
    });
  }

  // Étape 7: Like (et sauvegarde)
  like(s: Suggestion) {
    s.nbLikes++;
    this.saveSuggestionsToStorage();
  }

  // Étape 7: favoris (et sauvegarde)
  addToFavorites(s: Suggestion) {
    if (!this.isFavorite(s)) {
      this.favorites.push(s);
      this.saveFavoritesToStorage();
    }
  }

  isFavorite(s: Suggestion): boolean {
    return this.favorites.some(f => f.id === s.id);
  }

  removeFromFavorites(s: Suggestion) {
    this.favorites = this.favorites.filter(f => f.id !== s.id);
    this.saveFavoritesToStorage();
  }

  // ======================
  // LocalStorage (persist)
  // ======================

  private saveSuggestionsToStorage() {
    // Convert Date -> string (sinon JSON casse la date)
    const data = this.suggestions.map(s => ({
      ...s,
      date: s.date instanceof Date ? s.date.toISOString() : s.date
    }));
    localStorage.setItem(this.LS_SUGGESTIONS, JSON.stringify(data));
  }

  private loadSuggestionsFromStorage() {
    const raw = localStorage.getItem(this.LS_SUGGESTIONS);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as any[];
      // Remplacer les suggestions par la version sauvegardée (likes inclus)
      this.suggestions = data.map(x => ({
        ...x,
        date: new Date(x.date)
      })) as Suggestion[];
    } catch {
      // si storage corrompu -> ignorer
    }
  }

  private saveFavoritesToStorage() {
    const data = this.favorites.map(f => ({
      ...f,
      date: f.date instanceof Date ? f.date.toISOString() : f.date
    }));
    localStorage.setItem(this.LS_FAVORITES, JSON.stringify(data));
  }

  private loadFavoritesFromStorage() {
    const raw = localStorage.getItem(this.LS_FAVORITES);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as any[];
      this.favorites = data.map(x => ({
        ...x,
        date: new Date(x.date)
      })) as Suggestion[];
    } catch {
      // ignorer
    }
  }

}
