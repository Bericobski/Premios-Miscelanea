import { Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class Highlight {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'scale(1.03)'
    );

    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.2s ease'
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.removeStyle(
      this.el.nativeElement,
      'transform'
    );
  }
}
