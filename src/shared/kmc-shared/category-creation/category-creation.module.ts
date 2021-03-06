import {ModuleWithProviders, NgModule, Optional, Self} from '@angular/core';
import {CategoryCreationService} from 'app-shared/kmc-shared/category-creation/category-creation.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class CategoryCreationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CategoryCreationModule,
      providers: [CategoryCreationService]
    };
  }

  constructor(@Optional() @Self() categoryCreationService: CategoryCreationService) {
    if (categoryCreationService) {
      categoryCreationService.init();
    }
  }

}
