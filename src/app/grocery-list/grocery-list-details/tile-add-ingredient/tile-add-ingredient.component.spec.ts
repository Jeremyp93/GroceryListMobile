import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileAddIngredientComponent } from './tile-add-ingredient.component';
import { ElementRef, EventEmitter } from '@angular/core';
import { Ingredient } from '../../types/ingredient.type';
import { INGREDIENT_FORM } from '../../../constants';

class MockElementRef implements ElementRef {
  nativeElement = {};
  }

describe('TileAddIngredientComponent', () => {
  let component: TileAddIngredientComponent;
  let fixture: ComponentFixture<TileAddIngredientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileAddIngredientComponent],
      providers: [
        { provide: ElementRef, useClass: MockElementRef },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TileAddIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Component is initialized successfully with default values
  it('should initialize component with default values', () => {
    expect(component.itemAdded).toEqual(new EventEmitter<Ingredient>());
    expect(component.onClickOutside).toEqual(new EventEmitter<void>());
    expect(component.sections).toEqual([]);
    expect(component.categories).toEqual([]);
    expect(component.addForm).not.toBeUndefined();
    expect(component.formSubmitted).toBeFalse();
  });

  it('should add a new ingredient successfully', () => {
    const ingredient: Ingredient = {
      id: '1',
      name: 'Salt',
      amount: 2,
      category: 'Spices',
      selected: false
    };
    spyOn(component.itemAdded, 'emit');
    component.addForm.setValue({
      [INGREDIENT_FORM.ID]: ingredient.id,
      [INGREDIENT_FORM.NAME]: ingredient.name,
      [INGREDIENT_FORM.AMOUNT]: ingredient.amount,
      [INGREDIENT_FORM.CATEGORY]: ingredient.category
    });

    component.addItem();
    expect(component.formSubmitted).toBeFalse();
    expect(component.itemAdded.emit).toHaveBeenCalledWith({
      id: '1',
      name: 'Salt',
      amount: 2,
      category: 'Spices'
    } as any);
  });

  it('should not add a new ingredient with an invalid amount', () => {
    const ingredient: Ingredient = {
      id: '1',
      name: 'Salt',
      amount: -2,
      category: '',
      selected: false
    };
    spyOn(component.itemAdded, 'emit');
    component.addForm.setValue({
      [INGREDIENT_FORM.ID]: ingredient.id,
      [INGREDIENT_FORM.NAME]: ingredient.name,
      [INGREDIENT_FORM.AMOUNT]: ingredient.amount,
      [INGREDIENT_FORM.CATEGORY]: ingredient.category
    });

    component.addItem();
    expect(component.formSubmitted).toBeTrue();
    expect(component.itemAdded.emit).not.toHaveBeenCalled();
  });

  it('should not add a new ingredient without a name', () => {
    const ingredient: Ingredient = {
      id: '1',
      name: '',
      amount: 2,
      category: '',
      selected: false
    };
    spyOn(component.itemAdded, 'emit');
    component.addForm.setValue({
      [INGREDIENT_FORM.ID]: ingredient.id,
      [INGREDIENT_FORM.NAME]: ingredient.name,
      [INGREDIENT_FORM.AMOUNT]: ingredient.amount,
      [INGREDIENT_FORM.CATEGORY]: ingredient.category
    });

    component.addItem();
    expect(component.formSubmitted).toBeTrue();
    expect(component.itemAdded.emit).not.toHaveBeenCalled();
  });
});
