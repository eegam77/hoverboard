import { IronOverlayBehavior } from '@polymer/iron-overlay-behavior';
import { html, PolymerElement } from '@polymer/polymer';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { ReduxMixin } from '../../mixins/redux-mixin.js';
import { dialogsActions, helperActions, userActions } from '../../redux/actions.js';
import { DIALOGS } from '../../redux/constants.js';
import '../hoverboard-icons.js';
import '../shared-styles.js';

class SigninDialog extends ReduxMixin(mixinBehaviors([IronOverlayBehavior], PolymerElement)) {
  static get template() {
    return html`
    <style include="shared-styles flex flex-alignment">
      :host {
        margin: 0 auto;
        display: block;
        padding: 24px 32px;
        background: var(--primary-background-color);
        box-shadow: var(--box-shadow);
      }

      .dialog-content {
        margin: 0 auto;
      }

      .sign-in-button {
        margin: 16px 0;
        display: block;
        color: var(--primary-text-color);
      }

      .merge-content .subtitle,
      .merge-content .explanation {
        margin-bottom: 16px;
      }

      .icon-twitter {
        color: var(--twitter-color);
      }

      .icon-facebook {
        color: var(--facebook-color);
      }
    </style>

    <div class="dialog-content">
      <div class="initial-signin" hidden$="[[isMergeState]]">
        {% for provider in signInProviders.providersData %}
        <paper-button
          class="sign-in-button"
          on-tap="_signIn"
          provider-url="{$ provider.url $}"
          ga-on="click"
          ga-event-category="attendees"
          ga-event-action="sign-in"
          ga-event-label="signIn dialog - {$ provider.name $}"
          flex>
          <iron-icon class="icon-{$ provider.name $}" icon="hoverboard:{$ provider.name $}"></iron-icon>
          <span provider-url="{$ provider.url $}">{$ provider.label $}</span>
        </paper-button>
        {% endfor %}
      </div>
      <div class="merge-content" hidden$="[[!isMergeState]]">
        <h3 class="subtitle">{$ signInDialog.alreadyHaveAccount $}</h3>
        <div class="explanation">
          <div class="row-1">{$ signInDialog.alreadyUsed $} <b>[[email]]</b>.</div>
          <div class="row-2">
            {$ signInDialog.signInToContinue.part1 $}
            [[providerCompanyName]]
            {$ signInDialog.signInToContinue.part2 $}
          </div>
        </div>

        <div class="action-button" layout horizontal end-justified>
          <paper-button
            class="merge-button"
            on-tap="_mergeAccounts"
            ga-on="click"
            ga-event-category="attendees"
            ga-event-action="merge account"
            ga-event-label$="signIn merge account dialog -[[providerCompanyName]]"
            primary>
          <span>{$ signInDialog.signInToContinue.part1 $} [[providerCompanyName]]</span>
        </paper-button>
        </div>

      </div>
    </div>
`;
  }

  static get is() {
    return 'signin-dialog';
  }

  static get properties() {
    return {
      user: {
        type: Object,
      },
      isMergeState: {
        type: Boolean,
        value: false,
      },
      email: String,
      providerCompanyName: String,
    };
  }

  static mapStateToProps(state, _element) {
    return {
      user: state.user,
    };
  }

  constructor() {
    super();
    this.addEventListener('iron-overlay-canceled', this._close);
  }

  static get observers() {
    return [
      '_userChanged(user)',
    ];
  }

  _userChanged(user) {
    dialogsActions.closeDialog(DIALOGS.SIGNIN);
    if (!user.signedIn) {
      if (user.initialProviderId && user.pendingCredential) {
        this.isMergeState = true;
        this.email = user.email;
        this.providerCompanyName = helperActions.getProviderCompanyName(user.initialProviderId);
        dialogsActions.openDialog(DIALOGS.SIGNIN);
      }
    }
  }

  _mergeAccounts() {
    userActions.mergeAccounts(this.user.initialProviderId, this.user.pendingCredential);
    dialogsActions.closeDialog(DIALOGS.SIGNIN);
    this.isMergeState = false;
  }

  _close() {
    this.isMergeState = false;
    dialogsActions.closeDialog(DIALOGS.SIGNIN);
  }

  _signIn(event) {
    const providerUrl = event.target.getAttribute('provider-url');
    userActions.signIn(providerUrl);
  }
}

window.customElements.define(SigninDialog.is, SigninDialog);
