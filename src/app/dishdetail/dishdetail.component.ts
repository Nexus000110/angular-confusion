import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss']
  })
  
  export class DishdetailComponent implements OnInit {
  
      dish: Dish;
      dishIds: string[];
      prev: string;
      next: string;
      feedbackForm: FormGroup;
      comment: Comment;
    
      @ViewChild('fForm') feedbackFormDirective;
    
      formErrors = {
        'author': '',
        'comment': ''
      };
    
      validationMessages = {
        'author': {
          'required': 'Author name is required.',
          'minlength': 'Author name must be at least 2 characters.',
          'maxlength': 'Author name must be <= to 30 characters.'
        },
        'comment': {
          'required': 'Comment is required.',
          'minlength': 'Comment must be at least 1 characters.'
        },
    
      };
      constructor(private dishService: DishService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder) {
        this.createCommentForm();
      }
    
      ngOnInit() {
        this.dishService.getDishIds()
          .subscribe((dishIds) => this.dishIds = dishIds);
    
        this.route.params
          .pipe(switchMap((params: Params) => this.dishService
            .getDish(params['id'])))
          .subscribe(dish => {
            this.dish = dish;
            this.setPrevNext(dish.id);
          });
      }
    
      createCommentForm() {
        this.feedbackForm = this.fb.group({
          author: ['', [Validators.required,
          Validators.minLength(2), Validators.maxLength(30)]],
          rating: 5,
          comment: ['', [Validators.required,
          Validators.minLength(1)]],
        });
    
        this.feedbackForm.valueChanges
          .subscribe(data => this.onValueChanged(data));
    
        this.onValueChanged(); // reset form validation messages
      }
    
      onValueChanged(data?: any) {
        if (!this.feedbackForm) {
          return;
        }
    
        const form = this.feedbackForm;
    
        for (const field in this.formErrors) {
    
          if (this.formErrors.hasOwnProperty(field)) {
            // clear error messages
            this.formErrors[field] = '';
            const control = form.get(field);
    
            if (control && control.dirty && !control.valid) {
              const messages = this.validationMessages[field];
    
              for (const key in control.errors) {
    
                if (control.errors.hasOwnProperty(key)) {
                  this.formErrors[field] += messages[key] + ' ';
                }
    
              }
            }
          }
        }
      }
    
      setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1)
          % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1)
          % this.dishIds.length];
      }
    
      goBack(): void {
        this.location.back();
      }
    
      onSubmit() {
        this.comment = this.feedbackForm.value;
    
        var date: Date;
        var isoDate: string;
        
        date = new Date();
        isoDate = date.toISOString();
    
        this.comment.date = isoDate;
    
        this.dish.comments.push(this.comment);
    
        this.feedbackForm.reset({
          author: '',
          rating: 5,
          comment: ''
        });
      }
    }
    