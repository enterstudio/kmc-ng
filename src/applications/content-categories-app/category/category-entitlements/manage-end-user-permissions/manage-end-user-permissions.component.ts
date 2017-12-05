import {Component, Input, OnDestroy, OnInit,} from '@angular/core';

import {LoadingStatus, ManageEndUserPermissionsService, User, Users} from './manage-end-user-permissions.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BrowserService} from 'app-shared/kmc-shell';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {ISubscription} from 'rxjs/Subscription';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {Observable} from "rxjs/Observable";
import {KalturaCategoryUserPermissionLevel} from "kaltura-typescript-client/types/KalturaCategoryUserPermissionLevel";
import {KalturaUpdateMethodType} from "kaltura-typescript-client/types/KalturaUpdateMethodType";


@Component({
  selector: 'kManageEndUsers',
  templateUrl: './manage-end-user-permissions.component.html',
  styleUrls: ['./manage-end-user-permissions.component.scss'],
  providers: [ManageEndUserPermissionsService]
})
export class ManageEndUserPermissionsComponent implements OnInit, OnDestroy {

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedUsers: User[] = [];
  public _users: User[] = [];
  public _usersTotalCount: number = null;
  public _disabled = false;
  @Input() categoryId: number = null;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() categoryInheritUserPermissions: boolean = false;
  private usersSubscription: ISubscription;
  private querySubscription: ISubscription;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _manageEndUsersPermissionsService: ManageEndUserPermissionsService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    if (!this.categoryId) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.loadEndUserPermissions'),
        buttons: [{
          label: this._appLocalization.get('app.common.close'),
          action: () => {
            this._blockerMessage = null;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          }
        }
        ]
      });
      return undefined;
    }

    this.querySubscription = this._manageEndUsersPermissionsService.queryData$.subscribe(
      query => {
        this._filter.pageSize = query.pageSize;
        this._filter.pageIndex = query.pageIndex - 1;
      });

    this.usersSubscription = this._manageEndUsersPermissionsService.users$.subscribe(
      (data: Users) => {
        this._users = data.items;
        this._usersTotalCount = data.totalCount;
      }
    );

    this.querySubscription = this._manageEndUsersPermissionsService.state$.subscribe(
      (state: LoadingStatus) => {
        this._isBusy = state.loading;
        if (state.errorMessage) {
          this._blockerMessage = new AreaBlockerMessage({
            message: state.errorMessage ||
              this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.loadEndUserPermissions'),
            buttons: [{
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
                if (this.parentPopupWidget) {
                  this.parentPopupWidget.close();
                }
              }
            }
            ]
          })
        }
      });

    this._manageEndUsersPermissionsService.categoryId = this.categoryId;
  }

  ngOnDestroy() {
    this.usersSubscription.unsubscribe();
    this.querySubscription.unsubscribe();
  }

  public _reload() {
    this._clearSelection();
    this._manageEndUsersPermissionsService.reload(true);
  }

  _clearSelection() {
    this._selectedUsers = [];
  }

  _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {

      this._clearSelection();
      this._manageEndUsersPermissionsService.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  _onActionSelected({action, users, actionPayload}: { action: string, users: User | User[], actionPayload: any }) {
    let usersIds = [];
    if (Array.isArray(users) && users.length > 0) {
      usersIds = users.map(user => (user.id));
    } else {
      usersIds = [(<User>users).id];
    }
    switch (action) {
      case 'permissionLevel':
        this._executeAction(this._manageEndUsersPermissionsService.setPermissionLevel(usersIds,
          <KalturaCategoryUserPermissionLevel>actionPayload));
        break;
      case 'updateMethod':
        this._executeAction(this._manageEndUsersPermissionsService.setUpdateMethod(usersIds,
          <KalturaUpdateMethodType>actionPayload));
        break;
      case 'delete':
        this._executeAction(this._manageEndUsersPermissionsService.deleteUsers(usersIds));
        break;
      case 'activate':
        this._executeAction(this._manageEndUsersPermissionsService.activateUsers(usersIds));
        break;
      case 'deactivate':
        this._executeAction(this._manageEndUsersPermissionsService.deactivateUsers(usersIds));
        break;
      default:
        break;
    }
  }

  private _executeAction(observable$: Observable<void>) {
    observable$
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        res => {
          this._reload();
        }, error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error,
            buttons: [{
              label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.errors.reloadUsers'),
              action: () => {
                this._blockerMessage = null;
                this._manageEndUsersPermissionsService.reload(true);
              }
            }
            ]
          });
        }
      );
  }

  onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }

  public _deleteSelected(selectedUsers: User[]): void {
    this._clearSelection();
    // this._manageEndUsersPermissionsService.deleteUsers(selectedUsers);
  }
}