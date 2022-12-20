import {Component, Input, OnInit} from '@angular/core';
import {EpersonRegistrationService} from '../core/data/eperson-registration.service';
import {NotificationsService} from '../shared/notifications/notifications.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Registration} from '../core/shared/registration.model';
import {RemoteData} from '../core/data/remote-data';
import {ConfigurationDataService} from '../core/data/configuration-data.service';
import {getAllCompletedRemoteData} from '../core/shared/operators';

@Component({
  selector: 'ds-register-email-form',
  templateUrl: './register-email-form.component.html'
})
/**
 * Component responsible to render an email registration form.
 */
export class RegisterEmailFormComponent implements OnInit {

  /**
   * The form containing the mail address
   */
  form: FormGroup;

  /**
   * The message prefix
   */
  @Input()
  MESSAGE_PREFIX: string;

  validMailDomains: string[];

  constructor(
    private epersonRegistrationService: EpersonRegistrationService,
    private notificationService: NotificationsService,
    private translateService: TranslateService,
    private router: Router,
    private formBuilder: FormBuilder,
    private configurationService: ConfigurationDataService
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl('', {
        validators: [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')
        ],
      })
    });
    this.validMailDomains = [];
    this.configurationService.findByPropertyName('authentication-password.domain.valid')
      .pipe(getAllCompletedRemoteData())
      .subscribe((remoteData) => {
          for (const remoteValue of remoteData.payload.values) {
            this.validMailDomains.push(remoteValue);
          }
        }
      );
  }

  /**
   * Register an email address
   */
  register() {
    const typeMap = new Map<string, string>([
      ['register-page.registration', 'register'],
      ['forgot-email.form', 'forgot']
    ]);
    if (!this.form.invalid) {
      this.epersonRegistrationService.registerEmail(this.email.value, typeMap.get(this.MESSAGE_PREFIX)).subscribe((response: RemoteData<Registration>) => {
        if (response.hasSucceeded) {
          this.notificationService.success(this.translateService.get(`${this.MESSAGE_PREFIX}.success.head`),
            this.translateService.get(`${this.MESSAGE_PREFIX}.success.content`, {email: this.email.value}));
          this.router.navigate(['/home']);
        } else if (response.statusCode === 400) {
          this.notificationService.error(this.translateService.get(`${this.MESSAGE_PREFIX}.error.head`), this.translateService.get(`${this.MESSAGE_PREFIX}.error.maildomain`, { domains: this.validMailDomains.join(', ')}));
        } else {
          this.notificationService.error(this.translateService.get(`${this.MESSAGE_PREFIX}.error.head`),
            this.translateService.get(`${this.MESSAGE_PREFIX}.error.content`, {email: this.email.value}));
          this.notificationService.error('title', response.errorMessage);
        }
        }
      );
    }
  }

  get email() {
    return this.form.get('email');
  }

}
