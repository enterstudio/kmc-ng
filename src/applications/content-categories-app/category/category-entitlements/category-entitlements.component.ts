import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {CategoryEntitlementsWidget} from './category-entitlements-widget.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaCategoryUserPermissionLevel} from 'kaltura-ngx-client/api/types/KalturaCategoryUserPermissionLevel';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {BrowserService} from 'app-shared/kmc-shell';

@Component({
  selector: 'kCategoryEntitlements',
  templateUrl: './category-entitlements.component.html',
  styleUrls: ['./category-entitlements.component.scss'],
})
export class CategoryEntitlementsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('manageUsersPopup') manageUsersPopup: PopupWidgetComponent;
  public _defaultPermissionLevelOptions: { value: number, label: string }[] = [];

  public _membersCount: { loading: boolean, value: number, hasError?: boolean } = { loading: true, value: 0, hasError : false };
  constructor(public _widgetService: CategoryEntitlementsWidget,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._widgetService.attachForm();

    this._widgetService.data$
        .cancelOnDestroy(this)
        .subscribe(data =>
        {
            this._membersCount = { loading: !data, value: data ? data.membersCount : 0, hasError: false };
        });

    this._defaultPermissionLevelOptions = [{
      value: KalturaCategoryUserPermissionLevel.member,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.member')
    }, {
      value: KalturaCategoryUserPermissionLevel.contributor,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.contributor')
    }, {
      value: KalturaCategoryUserPermissionLevel.moderator,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.moderator')
    }, {
      value: KalturaCategoryUserPermissionLevel.manager,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.manager')
    }];
  }

  ngAfterViewInit() {
      this.manageUsersPopup.state$
          .cancelOnDestroy(this)
          .skip(1)
          .subscribe(data => {
                  if (data.state === PopupWidgetStates.Close) {
                      this._membersCount.loading = true;
                      this._membersCount.hasError = false;
                      this._widgetService.fetchUpdatedMembersCount()
                          .cancelOnDestroy(this)
                          .subscribe(
                              value =>
                              {
                                  this._membersCount.loading = false;
                                  this._membersCount.value = value;
                              },
                              error =>
                              {
                                  this._membersCount.loading = false;
                                  this._membersCount.hasError = true;
                              }
                          )
                  }
              }
          );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  get _contentPrivacyOptions() {
    return KalturaPrivacyType;
  }

  get _categoryListingOptions() {
    return KalturaAppearInListType;
  }

  get _contentPublishPermissionsOptions() {
    return KalturaContributionPolicyType;
  }

  // owner changed
  onOwnerChanged(owner: KalturaUser): void {
    // reset the form to have the new user in the textbox
    this._widgetService.entitlementsForm.patchValue({ owner });
    this._widgetService.setDirty();
  }

  public _toggleInherit({originalEvent, checked}: { originalEvent: Event, checked: boolean }) {
    const affectedControls =
      [this._widgetService.entitlementsForm.get('defaultPermissionLevel'),
       this._widgetService.entitlementsForm.get('owner')];

    affectedControls.forEach(ctrl => {
      if (checked === false) {
        ctrl.enable();
      } else {
        ctrl.disable();
      }
    });

    this._widgetService.setDirty();
  }


  public mananageUsersPermissions() {
    if (this._widgetService.entitlementsForm.get('inheritUsersPermissions').value === this._widgetService.inheritUsersPermissionsOriginalValue) {
      this.manageUsersPopup.open();
    } else {
      this._browserService.alert(
        {
          header: this._appLocalization
            .get('applications.content.categoryDetails.entitlements.manageUsersPermissionsEditMessage.title'),
          message: this._appLocalization
            .get('applications.content.categoryDetails.entitlements.manageUsersPermissionsEditMessage.description'),
          accept: () => {}
        });
    }
  }
}
