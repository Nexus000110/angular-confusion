import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FeedbackService } from '../services/feedback.service';
import { delay, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';

import { visibility, flyInOut, expand } from '../animations/app.animation';
import { resolve } from 'url';
import { MatSpinner } from '@angular/material';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackCopy: Feedback;
  formSubmit: Boolean;
  fbSpinner: Boolean;
  errMess: string;


  contactType = ContactType;

  @ViewChild('fform') feedbackFormDirective//???

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format.'
    },
  };

  constructor(private feedbackService: FeedbackService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('baseURL') private baseURL) {
  }

  ngOnInit() {
    this.formSubmit = false;
    this.fbSpinner = false;
    this.createForm();
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required,
      Validators.minLength(2),
      Validators.maxLength(25)]],
      lastname: ['', [Validators.required,
      Validators.minLength(2),
      Validators.maxLength(25)]],
      telnum: ['', [Validators.required,
      Validators.pattern]],
      email: ['', [Validators.required,
      Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //reset form validation messages
  }

  //control = form field
  onValueChanged(data?: any) {
    if (!this.feedbackForm) {
      return;
    } //has been created?

    const form = this.feedbackForm;

    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        //clear previous error message
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

  onSubmit() {
    this.formSubmit = true;
    this.fbSpinner = true;
    this.feedback = this.feedbackForm.value;

    this.feedbackService.submitFeedback(this.feedback)
      .subscribe(feedback => {
        this.feedback = feedback; this.feedbackCopy = feedback;
      },
        errmess => { this.feedback = null; this.feedbackCopy = null; this.errMess = <any>errmess; });

    /* POST and subscribe to Feedback object occurs nearly instantaneously e.g. Dish comments PUSH method.
    Therefore Spinner requires timeout to display. */
    setTimeout(() => this.fbSpinner = false, 1000);

    setTimeout(() => this.formSubmit = false, 5000);

    this.feedbackForm.reset();
  }
}
