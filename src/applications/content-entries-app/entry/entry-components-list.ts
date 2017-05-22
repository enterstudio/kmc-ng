import { EntryMetadata } from './entry-metadata/entry-metadata.component';
import { EntryThumbnails } from './entry-thumbnails/entry-thumbnails.component';
import { EntryAccessControl } from './entry-access-control/entry-access-control.component';
import { EntryScheduling } from './entry-scheduling/entry-scheduling.component';
import { EntryFlavours } from "./entry-flavours/entry-flavours.component";
import { DRMDetails } from './entry-flavours/drm-details/drm-details.component';
import { FlavorPreview } from './entry-flavours/flavor-preview/flavor-preview.component';
import { FlavorImport } from './entry-flavours/flavor-import/flavor-import.component';
import { EntryCaptions } from "./entry-captions/entry-captions.component";
import { EntryCaptionsEdit } from "./entry-captions/entry-captions-edit.component";
import { EntryLive } from "./entry-live/entry-live.component";
import { EntryRelated } from "./entry-related/entry-related.component";
import { EntryRelatedEdit } from "./entry-related/entry-related-edit.component";
import { EntryClips } from "./entry-clips/entry-clips.component";
import { EntryUsers } from "./entry-users/entry-users.component";
import { EntrySectionsList } from "./entry-sections-list/entry-sections-list.component";
import { EntryComponent } from './entry.component';
import { EntryPreview } from './entry-preview/entry-preview.component';
import { JumpToSection } from './entry-metadata/jump-to-section.component';
import { FileSizePipe } from './pipes/file-size.pipe';
import { ModerationPipe } from './pipes/moderation.pipe';
import { LinkedEntries } from './entry-metadata/entry-selector/linked-entries.component';
import { LinkedEntriesPopup } from './entry-metadata/entry-selector/linked-entries-popup.component';
import { LinkedEntriesPopup } from './entry-metadata/entry-selector/linked-entries-popup.component';


export const EntryComponentsList = [
    LinkedEntriesPopup,
    LinkedEntries,
    EntryCaptionsEdit,
    EntryRelatedEdit,
    EntryAccessControl,
    EntryCaptions,
    EntryClips,
    EntryComponent,
    EntryFlavours,
    DRMDetails,
    FlavorPreview,
    FlavorImport,
    EntryLive,
    EntryMetadata,
    EntryPreview,
    EntryRelated,
    EntryScheduling,
    EntrySectionsList,
    EntryThumbnails,
    EntryUsers,
    ModerationPipe,
    FileSizePipe,
    JumpToSection
];