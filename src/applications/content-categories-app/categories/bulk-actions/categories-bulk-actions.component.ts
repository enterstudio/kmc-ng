import {
  CategoriesBulkAddTagsService,
  CategoriesBulkChangeCategoryListingService,
  CategoriesBulkChangeContentPrivacyService,
  CategoriesBulkChangeContributionPolicyService,
  CategoriesBulkChangeOwnerService,
  CategoriesBulkDeleteService,
  CategoriesBulkRemoveTagsService
} from './services';
import {CategoriesBulkActionBaseService} from './services/categories-bulk-action-base.service';
import {MenuItem} from 'primeng/primeng';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {BrowserService} from 'app-shared/kmc-shell';
import {environment} from 'app-environment';
import {KalturaUser} from 'kaltura-ngx-client/api/types/KalturaUser';
import {PrivacyMode} from './components/bulk-change-content-privacy/bulk-change-content-privacy.component';
import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {AppearInListType} from './components/bulk-change-category-listing/bulk-change-category-listing.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';
import {CategoriesUtilsService} from "../../categories-utils.service";
import { CategoriesStatusMonitorService } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';

@Component({
  selector: 'kCategoriesBulkActions',
  templateUrl: './categories-bulk-actions.component.html',
  styleUrls: ['./categories-bulk-actions.component.scss']
})
export class CategoriesBulkActionsComponent implements OnInit, OnDestroy {

  public _bulkActionsMenu: MenuItem[] = [];
  public _bulkAction = '';

  @Input() selectedCategories: KalturaCategory[];

  @Output() onBulkChange = new EventEmitter<{ reload: boolean}>();

  @ViewChild('bulkActionsPopup') public bulkActionsPopup: PopupWidgetComponent;


  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _bulkAddTagsService: CategoriesBulkAddTagsService,
              private _bulkRemoveTagsService: CategoriesBulkRemoveTagsService,
              private _bulkChangeOwnerService: CategoriesBulkChangeOwnerService,
              private _bulkDeleteService: CategoriesBulkDeleteService,
              private _bulkChangeContentPrivacyService: CategoriesBulkChangeContentPrivacyService,
              private _bulkChangeCategoryListingService: CategoriesBulkChangeCategoryListingService,
              private _bulkChangeContributionPolicyService: CategoriesBulkChangeContributionPolicyService,
              private _categoriesUtilsService: CategoriesUtilsService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy() {

  }

  getBulkActionItems(): MenuItem[] {
    return [
      {
        label: this._appLocalization.get('applications.content.categories.bActions.addRemoveTags'), items: [
          { label: this._appLocalization.get('applications.content.categories.bActions.addTags'),
            command: () => { this.openBulkActionWindow('addTags', 500, 500) } },
          { label: this._appLocalization.get('applications.content.categories.bActions.removeTags'),
            command: () => { this.openBulkActionWindow('removeTags', 500, 500) } }]
      },
      { label: this._appLocalization.get('applications.content.categories.bActions.moveCategories'),
        command: () => { this._moveCategories() } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContentPrivacy'),
        command: () => { this.openBulkActionWindow('changeContentPrivacy', 586, 352) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryListing'),
        command: () => { this.openBulkActionWindow('changeCategoryListing', 586, 314) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeContributionPolicy'),
        command: () => { this.openBulkActionWindow('changeContributionPolicy', 586, 314) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryOwner'),
        command: () => { this.openBulkActionWindow('changeOwner', 500, 280) } },
      { label: this._appLocalization.get('applications.content.categories.bActions.delete'),
        command: () => { this.deleteCategories() } }
    ];
  }

  openBulkActionWindow(action: string, popupWidth: number, popupHeight: number) {

    if (this._categoriesUtilsService.hasEditWarnings(this.selectedCategories)) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.editCategory'),
          message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
          accept: () => {
            // use timeout to allow data binding of popup dimensions to update before opening the popup
            setTimeout(() => {
              this._bulkAction = action;
              // override the width and height of the popup
              this.bulkActionsPopup.popupWidth = popupWidth;
              this.bulkActionsPopup.popupHeight = popupHeight;
              this.bulkActionsPopup.open();
            }, 0);
          }
        }
      );
    } else {
      // use timeout to allow data binding of popup dimensions to update before opening the popup
      setTimeout(() => {
        this._bulkAction = action;
        this.bulkActionsPopup.popupWidth = popupWidth;
        this.bulkActionsPopup.popupHeight = popupHeight;
        this.bulkActionsPopup.open();
      }, 0);
    }

  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void {
    this.executeService(this._bulkAddTagsService, tags);
  }

  // remove tags changed
  onRemoveTagsChanged(tags: string[]): void {
    this.executeService(this._bulkRemoveTagsService, tags);
  }

  // owner changed
  onOwnerChanged(owners: KalturaUser[]): void {
    if (owners && owners.length) {
      this.executeService(this._bulkChangeOwnerService, owners[0]);
    }
  }

  // change content privacy
  onChangeContentPrivacyChanged(privacyMode: PrivacyMode): void {
    let privacyType: KalturaPrivacyType;
    if (privacyMode === PrivacyMode.NoRestriction)
      privacyType = KalturaPrivacyType.all;
    if (privacyMode === PrivacyMode.Private)
      privacyType = KalturaPrivacyType.membersOnly;
    if (privacyMode === PrivacyMode.RequiresAuthentication)
      privacyType = KalturaPrivacyType.authenticatedUsers;

    this.executeService(this._bulkChangeContentPrivacyService, privacyType);
  }

  // change category listing
  onChangeCategoryListingChanged(appearInList: AppearInListType): void {
    let appearInListType: KalturaAppearInListType;
    if (appearInList === AppearInListType.NoRestriction)
      appearInListType = KalturaAppearInListType.partnerOnly;
    if (appearInList === AppearInListType.Private)
      appearInListType = KalturaAppearInListType.categoryMembersOnly;

    this.executeService(this._bulkChangeCategoryListingService, appearInListType);
  }

  // change contribution policy
  onChangeContributionPolicyChanged(policyType: KalturaContributionPolicyType): void {
    this.executeService(this._bulkChangeContributionPolicyService, policyType);
  }

  // bulk delete
  public deleteCategories(): void {

    this._categoriesUtilsService.confirmDeleteMultiple(this.selectedCategories)
      .cancelOnDestroy(this)
      .subscribe(result => {
        if (result.confirmed) {
          setTimeout(() => {
            this.executeService(this._bulkDeleteService, {}, true, false, () => {this._categoriesStatusMonitorService.updateCategoriesStatus();});
            // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
          }, 0);
        }
      }, error => {
        this._browserService.setAppStatus({
          errorMessage: this._appLocalization
            .get('applications.content.categoryDetails.subcategories.errors.categoriesCouldNotBeDeleted')
        });
      });
  }

  private _moveCategories(): void {
    if (this.selectedCategories.length > 0) {
      const movingOnlySiblings: boolean = this.selectedCategories.every((category) => {
        return category.parentId === this.selectedCategories[0].parentId;
      });

      if (!movingOnlySiblings) {
        this._browserService.setAppStatus(
          {errorMessage: this._appLocalization.get('applications.content.moveCategory.errors.onlySiblingsMoveAllowed')});
      } else {
        this.openBulkActionWindow('moveCategories', 586, 580);
      }
    } else {
      console.log('[CategoriesBulkActionsComponent._moveCategories] this.selectedCategories.length must be greater than 0');
    }
  }

  private hasEditWarnings(): boolean {
    const editWarningsExists: boolean =
      // Find one of the selected categories that has '__EditWarning' in its 'tags' property
      !!this.selectedCategories.find(obj => {
          return (obj.tags && obj.tags.indexOf('__EditWarning') > -1);
        });

    return editWarningsExists;
  }


  private executeService(service: CategoriesBulkActionBaseService<any>, data: any = {}, reloadCategories: boolean = true, confirmChunks: boolean = true, callback?: Function): void {
    this._bulkAction = '';

    const execute = () => {
      service.execute(this.selectedCategories, data)
        .tag('block-shell')
        .subscribe(
        result => {
          if (callback) {
            callback(result);
          }
          this.onBulkChange.emit({ reload: reloadCategories });
        },
        error => {
          this._browserService.setAppStatus({ errorMessage: this._appLocalization.get('applications.content.bulkActions.errorCategories') });
          this.onBulkChange.emit({ reload: reloadCategories });
        }
      );
    };

    if (confirmChunks && this.selectedCategories.length > environment.modules.contentCategories.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmCategories', { '0': this.selectedCategories.length }),
          accept: () => {
            execute();
          }
        }
      );
    } else {
      execute();
    }
  }

}
