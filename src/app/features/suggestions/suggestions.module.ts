import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SuggestionsRoutingModule } from './suggestions-routing.module';
import { SuggestionsComponent } from './suggestions.component';
import { SuggestionDetailsComponent } from './suggestion-details/suggestion-details.component';
import { SuggestionFormComponent } from './suggestion-form/suggestion-form.component';

@NgModule({
  declarations: [
    SuggestionsComponent,
    SuggestionDetailsComponent,
    SuggestionFormComponent
  ],
  imports: [
    CommonModule,
    SuggestionsRoutingModule,
    ReactiveFormsModule  // ← Important !
  ]
})
export class SuggestionsModule { }