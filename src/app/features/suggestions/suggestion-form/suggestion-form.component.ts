import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-form',
  templateUrl: './suggestion-form.component.html',
  styleUrls: ['./suggestion-form.component.css']
})
export class SuggestionFormComponent implements OnInit {
  suggestionForm!: FormGroup;
  isEditMode = false;
  suggestionId?: number;
  
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.suggestionId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.suggestionId) {
      this.isEditMode = true;
      this.loadSuggestion(this.suggestionId);
    }
  }

  initForm(): void {
    const today = new Date();
    
    this.suggestionForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[A-Z][a-zA-Z ]*$')
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(30)
      ]],
      category: ['', Validators.required],
      date: [{ value: today.toISOString().split('T')[0], disabled: true }],
      status: [{ value: 'en_attente', disabled: true }]
    });
  }

  loadSuggestion(id: number): void {
    this.suggestionService.getSuggestionById(id).subscribe({
      next: (data) => {
        this.suggestionForm.patchValue({
          title: data.title,
          description: data.description,
          category: data.category,
          date: new Date(data.date).toISOString().split('T')[0],
          status: data.status
        });
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur lors du chargement');
        this.router.navigate(['/suggestions']);
      }
    });
  }

  onSubmit(): void {
    if (this.suggestionForm.valid) {
      const formValue = this.suggestionForm.getRawValue();
      
      const suggestionData = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        date: new Date(formValue.date),
        status: formValue.status,
        nbLikes: 0
      };

      if (this.isEditMode && this.suggestionId) {
        this.updateSuggestion(this.suggestionId, suggestionData);
      } else {
        this.addSuggestion(suggestionData);
      }
    }
  }

  addSuggestion(data: any): void {
    this.suggestionService.addSuggestion(data).subscribe({
      next: () => {
        alert(`✅ Suggestion "${data.title}" ajoutée !`);
        this.router.navigate(['/suggestions']);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur lors de l\'ajout');
      }
    });
  }

  updateSuggestion(id: number, data: any): void {
    this.suggestionService.updateSuggestion(id, data).subscribe({
      next: () => {
        alert(`✅ Suggestion "${data.title}" mise à jour !`);
        this.router.navigate(['/suggestions']);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur lors de la mise à jour');
      }
    });
  }

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