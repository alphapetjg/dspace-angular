import { Component } from '@angular/core';
import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { BrowseByTaxonomyPageComponent } from './browse-by-taxonomy-page.component';

@Component({
  selector: 'ds-themed-browse-by-taxonomy-page',
  templateUrl: './browse-by-taxonomy-page.component.html',
  styleUrls: []
})
/**
 * Themed wrapper for BrowseByTaxonomyPageComponent
 */
export class ThemedBrowseByTaxonomyPageComponent extends ThemedComponent<BrowseByTaxonomyPageComponent>{

  protected getComponentName(): string {
    return 'BrowseByTaxonomyPageComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/browse-by/browse-by-taxonomy-page/browse-by-taxonomy-page.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./browse-by-taxonomy-page.component`);
  }
}
