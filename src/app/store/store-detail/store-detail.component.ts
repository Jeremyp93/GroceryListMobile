import { Component, OnDestroy, OnInit, inject, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, lastValueFrom, take } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, CdkDragHandle } from '@angular/cdk/drag-drop';
import { trigger, transition, animate, style } from '@angular/animations';

import { Store as NgxsStore, Select } from '@ngxs/store';
import { StoreState } from '../ngxs-store/store.state';
import { Section } from '../types/section.type';
import { HeaderComponent } from '../../shared/header/header.component';
import { ROUTES_PARAM } from '../../constants';
import { AddSection, DeleteSection, DropSection, GetSelectedStore, SaveSections } from '../ngxs-store/store.actions';
import { ButtonComponent } from '../../shared/button/button.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { LoadingColor } from '../../shared/loading/loading-color.enum';
import { LoadingSize } from '../../shared/loading/loading-size.enum';
import { ButtonStyle } from '../../shared/button/button-style.enum';
import { LetDirective } from '@ngrx/component';
import { ButtonHover } from '../../shared/button/button-hover.enum';
import { ComponentCanDeactivate } from '../../guards/pending-changes-guard.service';
import { TileNewSectionComponent } from './tile-new-section/tile-new-section.component';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, LoadingComponent, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle, LetDirective],
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss',
  animations: [
    trigger('tileFadeSlideOut', [
      transition(':leave', [
        animate('300ms', style({ transform: 'translateX(100%)' })),
      ]),
    ])
  ]
})
export class StoreDetailComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  private ngxsStore = inject(NgxsStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  @Select(StoreState.getSections) sections$!: Observable<Section[]>;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer!: ViewContainerRef;
  title: string = 'Sections';
  isLoading: boolean = false;
  id: string = '';
  #routeSubscription!: Subscription;
  #itemAddedSubscription: Subscription | null = null;
  #addFormClosedSubscription: Subscription | null = null;
  saved: boolean = false;
  saveProcess: boolean = false;
  #pendingChanges: boolean = false;

  get loadingColors(): typeof LoadingColor {
    return LoadingColor;
  }

  get loadingSizes(): typeof LoadingSize {
    return LoadingSize;
  }

  get buttonStyles(): typeof ButtonStyle {
    return ButtonStyle;
  }

  get hoverChoices(): typeof ButtonHover {
    return ButtonHover;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.#pendingChanges;
  }

  ngOnInit(): void {
    this.isLoading = true;
    const selectedStore = this.ngxsStore.selectSnapshot(StoreState.getSelectedStore);
    if (selectedStore) {
      this.id = selectedStore.id;
      this.title = selectedStore.name;
      //this.initForm();
      this.isLoading = false;
      return;
    }

    this.#routeSubscription = this.route.params.subscribe(async (params: Params) => {
      this.id = params[ROUTES_PARAM.ID_PARAMETER];
      try {
        await lastValueFrom(this.ngxsStore.dispatch(new GetSelectedStore(this.id)));
      } catch {
        this.isLoading = false;
        return;
      }
      const selectedStore = this.ngxsStore.selectSnapshot(StoreState.getSelectedStore);
      if (!selectedStore) {
        this.isLoading = false;
        return;
      }
      this.title = selectedStore.name;
      //this.initForm();
      this.isLoading = false;
    });
  }

  deleteSection = (sectionId: string) => {
    this.ngxsStore.dispatch(new DeleteSection(sectionId)).subscribe(() => this.#pendingChanges = true);
  }

  editStore = () => {
    this.router.navigate([ROUTES_PARAM.STORE.EDIT], { relativeTo: this.route });
  }

  saveSections = () => {
    this.saveProcess = true;
    this.ngxsStore.dispatch(new SaveSections()).subscribe({
      next: () => {
        this.saveProcess = this.#pendingChanges = false;
        this.saved = true;
        setTimeout(() => {
          this.saved = false;
        }, 1000);
      },
      error: () => {
        this.saveProcess = false;
      }
    });
  }

  newSection = () => {
    const componentRef = this.dynamicComponentContainer.createComponent(TileNewSectionComponent);
    this.#itemAddedSubscription = componentRef.instance.itemAdded.subscribe(section => {
      this.ngxsStore.dispatch(new AddSection(section)).subscribe(() => {
        this.#pendingChanges = true
        this.#itemAddedSubscription?.unsubscribe();
        this.dynamicComponentContainer.clear();
      });
    });
    setTimeout(() => {
      this.#addFormClosedSubscription = componentRef.instance.onClickOutside.subscribe(() => {
        this.#addFormClosedSubscription?.unsubscribe();
        this.dynamicComponentContainer.clear();
      });
    });
  }

  drop = (event: CdkDragDrop<Section[]>) => {
    if (event.previousIndex === event.currentIndex) return;
    this.ngxsStore.dispatch(new DropSection(event.previousIndex, event.currentIndex)).subscribe(() => this.#pendingChanges = true);
  }

  ngOnDestroy(): void {
    if (this.#routeSubscription) {
      this.#routeSubscription.unsubscribe();
    }
    if (this.#itemAddedSubscription) {
      this.#itemAddedSubscription.unsubscribe();
    }
    if (this.#addFormClosedSubscription) {
      this.#addFormClosedSubscription.unsubscribe();
    }
  }
}
