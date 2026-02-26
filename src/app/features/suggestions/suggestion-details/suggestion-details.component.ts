import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrls: ['./suggestion-details.component.css']
})
export class SuggestionDetailsComponent implements OnInit, OnDestroy {
  suggestion?: Suggestion;
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    // ✅ écoute les changements d’ID et recharge à chaque fois
    this.sub = this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          if (!id || Number.isNaN(id)) {
            this.suggestion = undefined;
            throw new Error('ID invalide');
          }
          return this.suggestionService.getSuggestionById(id);
        })
      )
      .subscribe({
        next: (data: any) => {
          // ✅ si backend renvoie [obj] ou [], on gère
          const s = Array.isArray(data) ? data[0] : data;

          if (!s) {
            this.suggestion = undefined; // => affichera notFound
            return;
          }

          // ✅ sécuriser date
          this.suggestion = {
            ...s,
            date: new Date(s.date)
          } as Suggestion;
        },
        error: (err) => {
          console.error('❌ Erreur details:', err);
          this.suggestion = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  deleteSuggestion(): void {
    if (!this.suggestion) return;

    if (confirm(`Voulez-vous vraiment supprimer "${this.suggestion.title}" ?`)) {
      this.suggestionService.deleteSuggestion(this.suggestion.id).subscribe({
        next: () => {
          alert('✅ Suggestion supprimée');
          this.router.navigate(['/suggestions']);
        },
        error: (error) => {
          console.error('❌ Erreur:', error);
          alert('❌ Erreur lors de la suppression');
        }
      });
    }
  }
}