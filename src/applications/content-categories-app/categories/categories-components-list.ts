import { CategoriesTableComponent } from './categories-table.component';
import { CategoriesListComponent } from "./categories-list.component";
import { MaxCategoriesPipe } from './pipes/max-categories.pipe';
import { CategoriesBulkActionsComponent } from './bulk-actions/categories-bulk-actions.component';

export const CategoriesComponentsList = [
    CategoriesListComponent,
    CategoriesTableComponent,
    MaxCategoriesPipe,
    CategoriesBulkActionsComponent
];