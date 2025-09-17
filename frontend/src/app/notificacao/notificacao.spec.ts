import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notificacao } from './notificacao';

describe('Notificacao', () => {
  let component: Notificacao;
  let fixture: ComponentFixture<Notificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notificacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
