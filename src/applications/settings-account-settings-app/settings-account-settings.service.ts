import {Injectable} from '@angular/core';
import {KalturaClient} from 'kaltura-ngx-client';
import { KalturaMultiRequest, KalturaRequest, KalturaRequestBase } from 'kaltura-ngx-client';
import {KalturaUserRoleFilter} from 'kaltura-ngx-client/api/types/KalturaUserRoleFilter';
import {KalturaUserRoleStatus} from 'kaltura-ngx-client/api/types/KalturaUserRoleStatus';
import {KalturaUserFilter} from 'kaltura-ngx-client/api/types/KalturaUserFilter';
import {KalturaNullableBoolean} from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import {KalturaUserStatus} from 'kaltura-ngx-client/api/types/KalturaUserStatus';
import {UserRoleListAction} from 'kaltura-ngx-client/api/types/UserRoleListAction';
import {UserListAction} from 'kaltura-ngx-client/api/types/UserListAction';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaPartner} from 'kaltura-ngx-client/api/types/KalturaPartner';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {PartnerUpdateAction} from "kaltura-ngx-client/api/types/PartnerUpdateAction";
import {KalturaUserListResponse} from "kaltura-ngx-client/api/types/KalturaUserListResponse";


export interface AccountSettings {
  website: string;
  name: string;
  adminUserId: string;
  phone: string;
  describeYourself: string;
  referenceId: string;
}

@Injectable()
export class SettingsAccountSettingsService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  /** update the data for current partner */
  public updatePartnerData(data: AccountSettings): Observable<KalturaPartner> {
    const partner = new KalturaPartner({
      website: data.website,
      name: data.name,
      adminUserId: data.adminUserId,
      phone: data.phone,
      describeYourself: data.describeYourself,
      referenceId: data.referenceId
    });
    return this._kalturaServerClient.request(new PartnerUpdateAction({
      partner
    }))
      .monitor('update partner info');
  }


  /** Get the account owners list for current partner */
  public getPartnerAccountSettings(): Observable<any> {

    const userRoleFilter: KalturaUserRoleFilter = new KalturaUserRoleFilter({
      tagsMultiLikeOr: 'partner_admin',
      statusEqual: KalturaUserRoleStatus.active
    });

    const userFilter: KalturaUserFilter = new KalturaUserFilter({
      isAdminEqual: KalturaNullableBoolean.trueValue,
      loginEnabledEqual: KalturaNullableBoolean.trueValue,
      statusEqual: KalturaUserStatus.active,
      roleIdsEqual: '0'
    })
      .setDependency(['roleIdsEqual', 0, 'objects:0:id']);


    const multiRequest = new KalturaMultiRequest(
      new UserRoleListAction({filter: userRoleFilter}),
      new UserListAction({filter: userFilter}),
      new PartnerGetInfoAction()
    );

    return this._kalturaServerClient.multiRequest(multiRequest)
      .monitor('get account owners')
      .map(
        data => {
          if (data.hasErrors()) {
            throw new Error('error occurred in action \'getPartnerAccountSettings\'');
          }

          let accountOwners: string[] = [];
          let partnerData: KalturaPartner;
          data.forEach(response => {
            if (response.result instanceof KalturaUserListResponse) {
              accountOwners = response.result.objects.map(user => user.fullName).filter(name => name && name !== '');
              if (!accountOwners.length) {
                throw new Error('error occurred in action \'getPartnerAccountSettings\'');
              }
            } else if (response.result instanceof KalturaPartner) {
              partnerData = response.result;
            }
          });
          return {accountOwners, partnerData};
        })
  }
}
