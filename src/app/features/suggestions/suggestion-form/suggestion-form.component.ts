import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-suggestion-form',
  templateUrl: './suggestion-form.component.html',
  styleUrls: ['./suggestion-form.component.css']
})
export class SuggestionFormComponent implements OnInit {
  suggestionForm!: FormGroup;
  
  categories: string[] = [
    'Infrastructure et bâtiments',
    'Technologie et services numériques',
    'Restauration et cafétéria',
    'Hygiène et environnement',
    'Transport et mobilité',
    'Activités et événements',
    'Sécurité',
    'Communication interne',
    'Accessibilité',
    'Autre'
  ];

  // Même clé localStorage que dans list-suggestion
  private readonly LS_SUGGESTIONS = 'campusideas_suggestions';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date();
    
    this.suggestionForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[A-Z][a-zA-Z ]*$')  // Permet les espaces
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(30)
      ]],
      category: ['', Validators.required],
      date: [{ value: today.toISOString().split('T')[0], disabled: true }],
      status: [{ value: 'en_attente', disabled: true }]  // ✅ CHANGÉ : underscore au lieu d'espace
    });
  }

  onSubmit(): void {
    if (this.suggestionForm.valid) {
      const formValue = this.suggestionForm.getRawValue();
      
      // 1. Charger les suggestions existantes depuis localStorage
      const existingSuggestions = this.loadSuggestionsFromStorage();
      
      // 2. Générer un nouvel ID (max ID + 1)
      const newId = existingSuggestions.length > 0 
        ? Math.max(...existingSuggestions.map(s => s.id)) + 1 
        : 1;
      
      // 3. Créer la nouvelle suggestion avec statut normalisé
      const newSuggestion: Suggestion = {
        id: newId,
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        date: new Date(formValue.date),
        status: 'en_attente',  // ✅ CHANGÉ : toujours en_attente pour cohérence
        nbLikes: 0
      };

      // 4. Ajouter la nouvelle suggestion à la liste
      existingSuggestions.push(newSuggestion);
      
      // 5. Sauvegarder dans localStorage
      this.saveSuggestionsToStorage(existingSuggestions);

      // 6. Message de confirmation
      alert(`✅ Suggestion "${formValue.title}" ajoutée avec succès !`);
      
      // 7. Redirection vers la liste
      this.router.navigate(['/suggestions']);
    }
  }

  // =============================
  // Méthodes localStorage
  // =============================

  private loadSuggestionsFromStorage(): Suggestion[] {
    const raw = localStorage.getItem(this.LS_SUGGESTIONS);
    
    if (!raw) {
      // Si localStorage est vide, retourner les suggestions par défaut
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

  private saveSuggestionsToStorage(suggestions: Suggestion[]): void {
    const data = suggestions.map(s => ({
      ...s,
      date: s.date instanceof Date ? s.date.toISOString() : s.date
    }));
    localStorage.setItem(this.LS_SUGGESTIONS, JSON.stringify(data));
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

  // =============================
  // Validation & Messages erreur
  // =============================

  hasError(controlName: string, errorType: string): boolean {
    const control = this.suggestionForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.suggestionForm.get(controlName);
    
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    
    if (controlName === 'title') {
      if (control.hasError('minlength')) {
        return 'Le titre doit contenir au minimum 5 caractères';
      }
      if (control.hasError('pattern')) {
        return 'Le titre doit commencer par une majuscule et contenir uniquement des lettres';
      }
    }
    
    if (controlName === 'description') {
      if (control.hasError('minlength')) {
        return 'La description doit contenir au minimum 30 caractères';
      }
    }
    
    return '';
  }
}