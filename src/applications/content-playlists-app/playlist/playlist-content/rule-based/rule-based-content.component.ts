import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlaylistStore } from '../../playlist-store.service';
import { RuleBasedContentWidget } from './rule-based-content-widget.service';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';

@Component({
  selector: 'kPlaylistContentRuleBased',
  templateUrl: './rule-based-content.component.html',
  styleUrls: ['./rule-based-content.component.scss'],
  providers: [EntriesStore]
})
export class RuleBasedContentComponent implements OnInit, OnDestroy {
  @ViewChild('playlistRule') private _rulePopup: PopupWidgetComponent;

  public _selectedRules: PlaylistRule[] = [];
  public _selectedRule: PlaylistRule = null;

  constructor(public _playlistStore: PlaylistStore,
              public _widgetService: RuleBasedContentWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();

    this._widgetService.selectedRule$.subscribe(rule => {
      this._selectedRule = rule;
      this._rulePopup.open();
    })
  };

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _clearSelection() {
    this._selectedRules = [];
  }

  public _onActionSelected(event: { action: string, rule: PlaylistRule }): void {
    this._clearSelection();
    this._widgetService.onActionSelected(event);
  }

  public _deleteSelected(selectedRules: PlaylistRule[]): void {
    this._clearSelection();
    this._widgetService.deleteSelectedRules(selectedRules);
  }
}
