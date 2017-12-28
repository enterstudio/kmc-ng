import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import {
    EntriesFilters, EntriesStore,
    SortDirection
} from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {
    EntriesRefineFiltersService,
    RefineGroup
} from 'app-shared/content-shared/entries-store/entries-refine-filters.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss']

})
export class EntriesListComponent implements OnInit, OnDestroy {
    @Input() showReloadButton = true;
    private _showLoader = false;
    private _blockerMessage: AreaBlockerMessage = null;
    private _refineFiltersGroups: RefineGroup[];
    @Input() selectedEntries: any[] = [];
    @Input() columns: EntriesTableColumns | null;
    @Input() rowActions: { label: string, commandName: string }[];

    @ViewChild('tags') private tags: StickyComponent;

  @Output() onActionsSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();

    public _query = {
        freetext: '',
        createdAfter: null,
        createdBefore: null,
        pageIndex: 0,
        pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
        sortBy: 'createdAt',
        sortDirection: SortDirection.Desc
    };

    constructor(private _entriesStore: EntriesStore,
                private _browserService: BrowserService,
                private _refineFilters: EntriesRefineFiltersService,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this._prepare();
    }

    private _prepare(): void{
        this._showLoader = true;
        this._refineFilters.getFilters()
            .cancelOnDestroy(this)
            .first() // only handle it once, no need to handle changes over time
            .subscribe(
                groups => {
                    this._showLoader = false;
                    this._refineFiltersGroups = groups;
                    this._restoreFiltersState();
                    this._registerToFilterStoreDataChanges();
                },
                error => {
                    this._showLoader = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        message: error.message || this._appLocalization.get('applications.content.filters.errorLoading'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._blockerMessage = null;
                                this._prepare();
                            }
                        }
                        ]
                    })
                });

        this._refineFilters.getFilters()

        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
    }

    private _restoreFiltersState(): void {
        this._updateComponentState(this._entriesStore.cloneFilters(
            [
                'freetext',
                'pageSize',
                'pageIndex',
                'sortBy',
                'sortDirection'
            ]
        ));
    }

    private _updateComponentState(updates: Partial<EntriesFilters>): void {
        if (typeof updates.freetext !== 'undefined') {
            this._query.freetext = updates.freetext || '';
        }

        if (typeof updates.pageSize !== 'undefined') {
            this._query.pageSize = updates.pageSize;
        }

        if (typeof updates.pageIndex !== 'undefined') {
            this._query.pageIndex = updates.pageIndex;
        }

        if (typeof updates.sortBy !== 'undefined') {
            this._query.sortBy = updates.sortBy;
        }

        if (typeof updates.sortDirection !== 'undefined') {
            this._query.sortDirection = updates.sortDirection;
        }
    }

    private _registerToFilterStoreDataChanges(): void {
        this._entriesStore.filtersChange$
            .cancelOnDestroy(this)
            .subscribe(({changes}) => {
                this._updateComponentState(changes);
                this.clearSelection();
                this._browserService.scrollToTop();
            });
    }

    onFreetextChanged(): void {
        this._entriesStore.filter({freetext: this._query.freetext});
    }

    onSortChanged(event) {
        this._entriesStore.filter({
            sortBy: event.field,
            sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
        });
    }

    onPaginationChanged(state: any): void {
        if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
            this._entriesStore.filter({
                pageIndex: state.page,
                pageSize: state.rows
            });
        }
    }


    ngOnDestroy() {
    }

    public _reload() {
        this.clearSelection();
        this._browserService.scrollToTop();
        this._entriesStore.reload();
    }

    clearSelection() {
        this.selectedEntries = [];
    }

    onTagsChange() {
        this.tags.updateLayout();
    }


    onBulkChange(event): void {
        if (event.reload === true) {
            this._reload();
        }
    }
}

