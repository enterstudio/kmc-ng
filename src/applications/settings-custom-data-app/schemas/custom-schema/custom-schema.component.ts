import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';
import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';

@Component({
  selector: 'kCustomSchema',
  templateUrl: './custom-schema.component.html',
  styleUrls: ['./custom-schema.component.scss']
})
export class CustomSchemaComponent {
  @Input() set schema(value: SettingsMetadataProfile) {
    if (value) {
      this._schema = value;
      this._title = this._appLocalization.get('applications.settings.metadata.editCustomSchema');
    } else {
      this._title = this._appLocalization.get('applications.settings.metadata.addCustomSchema');
      const schema = <SettingsMetadataProfile>(new KalturaMetadataProfile({
        name: '',
        description: '',
        systemName: ''
      }));
      schema.isNew = true;
      schema.profileDisabled = false;
      schema.applyTo = this._appLocalization.get('applications.settings.metadata.applyTo.entries');

      this._schema = schema;
    }
  }
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<SettingsMetadataProfile>();

  public _title;
  public _schema: SettingsMetadataProfile;
  public _selectedFields: any[] = [];

  constructor(private _appLocalization: AppLocalization) {
  }

  public _saveSchema(): void {
    console.warn(this._schema);
    this.onSave.emit(this._schema);
    this.onClosePopupWidget.emit();
  }

  public _clearSelection(): void {
    this._selectedFields = [];
  }
}

