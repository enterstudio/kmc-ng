import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';

export class MediaTypesFilter extends ValueFilter<string> {

  constructor(value: string, label: string) {
    super(label, value, { token: 'applications.content.filters.mediaType', args: { '0': label } });
  }
}

EntriesStore.registerFilterType(MediaTypesFilter, (items, request) => {
  request.filter.mediaTypeIn = R.reduce((acc: string, item: ValueFilter<string>) => {
    return `${acc}${acc ? ',' : ''}${item.value}`;
  }, '', items);
});
