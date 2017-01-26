import { EntriesStore } from "../entries-store.service";
import { ValueFilter } from '../value-filter';

function toServerDate(value?: Date): number {
    return value ? value.getTime() / 1000 : null;
}

export class TimeSchedulingFilter  extends ValueFilter<string>{


    private _scheduledBefore : Date;
    private _scheduledAfter : Date;

    public get scheduledAfter() : Date{
        return this._scheduledAfter;
    }

    public get scheduledBefore() : Date{
        return this._scheduledBefore;
    }

    constructor(value : string, label : string, scheduledTo? : Date, scheduledFrom? : Date)
    {
        super(value, label);
        this._scheduledAfter = scheduledFrom;
        this._scheduledBefore = scheduledTo;
    }
}

EntriesStore.registerFilterType(TimeSchedulingFilter, (items, request) =>
{

    items.forEach((item : TimeSchedulingFilter) =>
    {
        switch (item.value)
        {
            case 'past':
                if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < toServerDate(new Date())) {
                    request.filter.endDateLessThanOrEqual = toServerDate(new Date());
                }
                break;
            case 'live':
                if (request.filter.startDateLessThanOrEqualOrNull === undefined || request.filter.startDateLessThanOrEqualOrNull > toServerDate(new Date())) {
                    request.filter.startDateLessThanOrEqualOrNull = toServerDate(new Date());
                }
                if (request.filter.endDateGreaterThanOrEqualOrNull === undefined || request.filter.endDateGreaterThanOrEqualOrNull < toServerDate(new Date())) {
                    request.filter.endDateGreaterThanOrEqualOrNull = toServerDate(new Date());
                }
                break;
            case 'future':
                if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > toServerDate(new Date())) {
                    request.filter.startDateGreaterThanOrEqual = toServerDate(new Date());
                }
                break;
            case 'scheduled':
                if (item.scheduledAfter) {
                    if (request.filter.startDateGreaterThanOrEqual === undefined || request.filter.startDateGreaterThanOrEqual > toServerDate(item.scheduledAfter)) {
                        request.filter.startDateGreaterThanOrEqual = toServerDate(item.scheduledAfter);
                    }
                }

                if (item.scheduledBefore) {
                    if (request.filter.endDateLessThanOrEqual === undefined || request.filter.endDateLessThanOrEqual < toServerDate(item.scheduledBefore)) {
                        request.filter.endDateLessThanOrEqual = toServerDate(item.scheduledBefore);
                    }
                }

                break;
            default:
                break
        }
    });
});