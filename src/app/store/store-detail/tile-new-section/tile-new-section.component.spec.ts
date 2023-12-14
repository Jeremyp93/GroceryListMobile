import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileNewSectionComponent } from './tile-new-section.component';

describe('TileNewSectionComponent', () => {
  let component: TileNewSectionComponent;
  let fixture: ComponentFixture<TileNewSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileNewSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TileNewSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
