import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookBtrTableComponent } from './book-btr-table.component';

describe('BookBtrTableComponent', () => {
  let component: BookBtrTableComponent;
  let fixture: ComponentFixture<BookBtrTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookBtrTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookBtrTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
