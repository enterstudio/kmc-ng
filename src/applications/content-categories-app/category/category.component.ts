import {CategoryMetadataWidget} from './category-metadata/category-metadata-widget.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionTypes, CategoryService} from './category.service';
import {CategorySectionsListWidget} from './category-sections-list/category-sections-list-widget.service';
import {CategoriesService} from '../categories/categories.service';
import {CategoryWidgetsManager} from './category-widgets-manager';
import {AreaBlockerMessage, AreaBlockerMessageButton} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Observable} from 'rxjs/Observable';
import {CategoryEntitlementsWidget} from './category-entitlements/category-entitlements-widget.service';
import {CategorySubcategoriesWidget} from './category-subcategories/category-subcategories-widget.service';
import {CategoryDetailsWidget} from "./category-details/category-details-widget.service";
import {
  CategoriesStatus,
  CategoriesStatusMonitorService
} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { BrowserService } from 'app-shared/kmc-shell';


@Component({
  selector: 'kCategory',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers: [
    CategoryService,
    CategoryWidgetsManager,
    CategorySectionsListWidget,
    CategoryDetailsWidget,
    CategoryMetadataWidget,
      CategoryEntitlementsWidget,
    CategorySubcategoriesWidget
  ]
})
export class CategoryComponent implements OnInit, OnDestroy {

  public _categoryHeader: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public _currentCategoryId: number;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

  constructor(categoryWidgetsManager: CategoryWidgetsManager,
              widget1: CategorySectionsListWidget,
              widget2: CategoryDetailsWidget,
              widget3: CategoryMetadataWidget,
              widget4: CategorySubcategoriesWidget,
              widget5: CategoryEntitlementsWidget,
              public _categoryStore: CategoryService,
              private _browserService: BrowserService,
              private _categoriesStore: CategoriesService,
              private _appLocalization: AppLocalization,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

    categoryWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4, widget5]);

  }

  ngOnDestroy() {
  }



  ngOnInit() {
    this._showLoader = true;
    this._categoriesStatusMonitorService.status$
	    .cancelOnDestroy(this)
	    .first()
	    .subscribe((status: CategoriesStatus) => {
          if (status.lock){
            this._browserService.alert({
              header: this._appLocalization.get('app.common.attention'),
              message: this._appLocalization.get('applications.content.categories.categoriesLockMsg')
            });
            this._showLoader = false;
            this._categoryStore.returnToCategories(true);
          }else
          {
            this._prepare();
          }
        });
  }

  private _prepare(): void{
    this._categoryStore.state$
	    .cancelOnDestroy(this)
	    .subscribe(
            status => {
              this._showLoader = false;
              this._areaBlockerMessage = null;

              if (status) {
                switch (status.action) {
                  case ActionTypes.CategoryLoading:
                    this._showLoader = true;

                    // when loading new category in progress, the 'categoryID' property
                    // reflect the category that is currently being loaded
                    // while 'category$' stream is null
                    this._currentCategoryId = +this._categoryStore.categoryId;
                    this._updateNavigationState();

                    break;
                  case ActionTypes.CategoryLoaded:
                    this._categoryHeader = this._appLocalization.get('applications.content.categoryDetails.header', { 0: this._categoryStore.category.name });
                    break;
                  case ActionTypes.CategoryLoadingFailed:
                    let message = status.error ? status.error.message : '';
                    message = message || this._appLocalization.get('applications.content.errors.loadError');
                    this._areaBlockerMessage = new AreaBlockerMessage({
                      message: message,
                      buttons: [
                        this._createBackToCategoriesButton()
                      ]

                    });
                    break;
                  case ActionTypes.CategorySaving:
                    // loader is enabled using 'block-shell' tag automatically, no need to set the showLoader = true
                    break;
                  case ActionTypes.CategorySavingFailed:

                    this._areaBlockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.content.categoryDetails.errors.saveError'),
                      buttons: [
                        {
                          label: this._appLocalization.get('applications.content.categoryDetails.errors.reload'),
                          action: () => {
                            this._categoryStore.reloadCategory();
                          }
                        }
                      ]
                    });
                    break;
                  case ActionTypes.CategoryDataIsInvalid:

                    this._areaBlockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.content.categoryDetails.errors.validationError'),
                      buttons: [
                        {
                          label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                          action: () => {
                            this._areaBlockerMessage = null;
                          }
                        }
                      ]
                    });
                    break;
                  case ActionTypes.ActiveSectionBusy:

                    this._areaBlockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.content.categoryDetails.errors.busyError'),
                      buttons: [
                        {
                          label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                          action: () => {
                            this._areaBlockerMessage = null;
                          }
                        }
                      ]
                    });
                    break;
                  case ActionTypes.CategoryPrepareSavingFailed:

                    this._areaBlockerMessage = new AreaBlockerMessage({
                      message: this._appLocalization.get('applications.content.categoryDetails.errors.savePrepareError'),
                      buttons: [
                        {
                          label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                          action: () => {
                            this._areaBlockerMessage = null;
                          }
                        }
                      ]
                    });
                    break;
                  default:
                    break;
                }
              }
            },
            error => {
              // TODO [kmcng] navigate to error page
              throw error;
            });
  }

  private _updateNavigationState(): void {
    // TODO [kmcng] find a better way that doesn't need access to the category directly
    const categories = this._categoriesStore.categories;
    if (categories.data() && categories.data().length && this._currentCategoryId) {
      const currentCategoryIndex = categories.data().findIndex(category => category.id === +this._currentCategoryId);
      this._enableNextButton = currentCategoryIndex >= 0 && (currentCategoryIndex < categories.data().length - 1);
      this._enablePrevButton = currentCategoryIndex > 0;
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

  private _createBackToCategoriesButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.categoryDetails.backToCategories'),
      action: () => {
        this._categoryStore.returnToCategories();
      }
    };
  }

  public _backToList() {
    this._categoryStore.returnToCategories();
  }

  public _save() {
    this._categoryStore.saveCategory();
  }


  public _navigateToPrevious(): void {
    const categories = this._categoriesStore.categories.data();

    if (categories && this._currentCategoryId) {
      const currentCategory = categories.find(entry => entry.id === this._currentCategoryId);
      const currentCategoryIndex = currentCategory ? categories.indexOf(currentCategory) : -1;
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1];
        this._categoryStore.openCategory(prevCategory.id);
      }
    }
  }

  public _navigateToNext(): void {
    const categories = this._categoriesStore.categories.data();

    if (categories && this._currentCategoryId) {
      const currentCategory = categories.find(entry => entry.id === this._currentCategoryId);
      const currentCategoryIndex = currentCategory ? categories.indexOf(currentCategory) : -1;
      if (currentCategoryIndex >= 0 && (currentCategoryIndex < categories.length - 1)) {
        const nextEntry = categories[currentCategoryIndex + 1];
        this._categoryStore.openCategory(nextEntry.id);
      }
    }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._categoryStore.canLeaveWithoutSaving();
  }

}

