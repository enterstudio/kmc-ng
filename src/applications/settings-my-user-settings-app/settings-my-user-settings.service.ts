import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { UserGetAction } from 'kaltura-ngx-client/api/types/UserGetAction';
import { UserRoleGetAction } from 'kaltura-ngx-client/api/types/UserRoleGetAction';
import { UserUpdateLoginDataAction, UserUpdateLoginDataActionArgs } from 'kaltura-ngx-client/api/types/UserUpdateLoginDataAction';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { AppAuthentication } from 'app-shared/kmc-shell';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(private _kalturaServerClient: KalturaClient,
              private _appAuth: AppAuthentication,
              private _appLocalization: AppLocalization) {
  }

  public getUserData(): Observable<{ user: KalturaUser, role: KalturaUserRole }> {
    const request = new KalturaMultiRequest(
      new UserGetAction(),
      new UserRoleGetAction({ userRoleId: 0 })
        .setDependency(['userRoleId', 0, 'roleIds'])
    );

    return this._kalturaServerClient
      .multiRequest(request)
      .map(([user, role]) => {
        if (user.error || role.error) {
          throw new Error((user.error || role.error).message)
        }

        return {
          user: user.result,
          role: role.result
        }
      })
      .catch(() => {
        return Observable.throw(new Error(this._appLocalization.get('applications.settings.myUserSettings.errors.getUserData')));
      });
  }

  public updateLoginData(userData: UserUpdateLoginDataActionArgs): Observable<void> {
    return this._kalturaServerClient
      .request(new UserUpdateLoginDataAction(userData))
      .catch(error => {
        const message = error && error.message
          ? error.code === 'PASSWORD_STRUCTURE_INVALID'
            ? this._appLocalization.get('applications.settings.myUserSettings.errors.passwordStructure')
            : error.message
          : this._appLocalization.get('applications.settings.myUserSettings.errors.updateUser');
        return Observable.throw(new Error(message));
      })
  }

  public updateUserNameManually(user: KalturaUser): void {
    if (user && user.firstName && user.lastName && user.fullName) {
      this._appAuth._updateNameManually(user.firstName, user.lastName, user.fullName);
    }
  }
}
