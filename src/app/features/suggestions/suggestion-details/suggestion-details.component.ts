import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrls: ['./suggestion-details.component.css']
})
export class SuggestionDetailsComponent implements OnInit {
  suggestion?: Suggestion;

  // Même clé que dans list-suggestion
  private readonly LS_SUGGESTIONS = 'campusideas_suggestions';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    // Charger depuis localStorage
    const suggestions = this.loadSuggestionsFromStorage();
    this.suggestion = suggestions.find(s => s.id === id);
    
    console.log('ID recherché:', id);
    console.log('Suggestion trouvée:', this.suggestion);
  }

  private loadSuggestionsFromStorage(): Suggestion[] {
    const raw = localStorage.getItem(this.LS_SUGGESTIONS);
    
    if (!raw) {
      return this.getDefaultSuggestions();
    }

    try {
      const data = JSON.parse(raw) as any[];
      return data.map(x => ({
        ...x,
        date: new Date(x.date)
      })) as Suggestion[];
    } catch {
      return this.getDefaultSuggestions();
    }
  }

  private getDefaultSuggestions(): Suggestion[] {
    return [
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
  }
}