import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileIngredientComponent } from './tile-ingredient.component';
import { Ingredient } from '../../types/ingredient.type';
import { ButtonStyle } from '../../../shared/button/button-style.enum';
import { ButtonHover } from '../../../shared/button/button-hover.enum';

describe('TileIngredientComponent', () => {
  let component: TileIngredientComponent;
  let fixture: ComponentFixture<TileIngredientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileIngredientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TileIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onIngredientDeleted event when showDeleteList is called', () => {
    // Mock ingredient
    const mockIngredient: Ingredient = {
      id: '1',
      name: 'Ingredient 1',
      amount: 10,
      category: 'Category 1',
      selected: false
    };;
    component.ingredient = mockIngredient;

    // Spy on the EventEmitter
    spyOn(component.onIngredientDeleted, 'emit');

    // Trigger the method
    const eventMock = new Event('click');
    component.showDeleteList(eventMock);

    // Expect the event to have been emitted with the ingredient ID
    expect(component.onIngredientDeleted.emit).toHaveBeenCalledWith(mockIngredient.id);
  });

  it('should have buttonStyles and hoverChoices defined', () => {
    // Ensure buttonStyles and hoverChoices are defined
    expect(component.buttonStyles).toBeDefined();
    expect(component.hoverChoices).toBeDefined();

    // Ensure buttonStyles and hoverChoices are of the correct type
    expect(component.buttonStyles).toEqual(ButtonStyle);
    expect(component.hoverChoices).toEqual(ButtonHover);
  });
});
