import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLoadingComponent } from './music-loading.component';

describe('MusicLoadingComponent', () => {
  let component: MusicLoadingComponent;
  let fixture: ComponentFixture<MusicLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MusicLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
