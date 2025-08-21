import slideDown from '@ui/composables/slideDown';
import slideToggle from '@ui/composables/slideToggle';
import slideUp from '@ui/composables/slideUp';

describe('composables: slideDown/slideUp/slideToggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('slideDown should expand element and cleanup styles after duration', () => {
    const el = document.createElement('div');
    el.style.display = 'none';

    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ display: 'none' } as unknown as CSSStyleDeclaration);

    Object.defineProperty(el, 'offsetHeight', { get: () => 100 });

    slideDown(el, 50);

    expect(el.classList.contains('transitioning')).toBe(true);
    expect(el.style.display).toBe('block');
    expect(el.style.height).toBe('100px');
    expect(el.style.transitionProperty).toBe('height, margin, padding');

    jest.advanceTimersByTime(50);

    expect(el.style.height).toBe('');
    expect(el.style.overflow).toBe('');
    expect(el.style.transitionDuration).toBe('');
    expect(el.style.transitionProperty).toBe('');
    expect(el.classList.contains('transitioning')).toBe(false);
  });

  it('slideDown should do nothing if already transitioning', () => {
    const el = document.createElement('div');
    el.classList.add('transitioning');
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    slideDown(el, 10);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(el.classList.contains('transitioning')).toBe(true);
  });

  it('slideUp should collapse element and cleanup styles after duration', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetHeight', { get: () => 120 });

    slideUp(el, 40);

    expect(el.classList.contains('transitioning')).toBe(true);
    expect(el.style.transitionProperty).toBe('height, margin, padding');
    // JSDOM normaliza a '0px'
    expect(el.style.height).toBe('0px');

    jest.advanceTimersByTime(40);

    expect(el.style.display).toBe('none');
    expect(el.style.height).toBe('');
    expect(el.style.overflow).toBe('');
    expect(el.style.transitionDuration).toBe('');
    expect(el.style.transitionProperty).toBe('');
    expect(el.classList.contains('transitioning')).toBe(false);
  });

  it('slideUp should do nothing if already transitioning', () => {
    const el = document.createElement('div');
    el.classList.add('transitioning');
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    slideUp(el, 10);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(el.classList.contains('transitioning')).toBe(true);
  });

  it('slideToggle should call slideDown when hidden and slideUp when visible', () => {
    jest.resetModules();
    const slideDownMock = jest.fn();
    const slideUpMock = jest.fn();

    jest.doMock('@ui/composables/slideDown', () => ({ __esModule: true, default: slideDownMock }));
    jest.doMock('@ui/composables/slideUp', () => ({ __esModule: true, default: slideUpMock }));

    // Re-require slideToggle to use mocked dependencies

    const toggle = require('@ui/composables/slideToggle').default as typeof slideToggle;

    const elHidden = document.createElement('div');
    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValueOnce({ display: 'none' } as unknown as CSSStyleDeclaration)
      .mockReturnValueOnce({ display: 'block' } as unknown as CSSStyleDeclaration);

    toggle(elHidden, 30);
    expect(slideDownMock).toHaveBeenCalledWith(elHidden, 30);

    const elVisible = document.createElement('div');
    toggle(elVisible, 25);
    expect(slideUpMock).toHaveBeenCalledWith(elVisible, 25);
  });

  it('slideDown uses default duration and keeps non-none display', () => {
    const el = document.createElement('div');
    el.style.display = 'inline';

    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ display: 'inline' } as unknown as CSSStyleDeclaration);

    Object.defineProperty(el, 'offsetHeight', { get: () => 80 });

    slideDown(el); // no duration -> default 300ms

    expect(el.style.transitionDuration).toBe('300ms');
    expect(el.style.display).toBe('inline');

    jest.advanceTimersByTime(300);
    expect(el.style.transitionDuration).toBe('');
    expect(el.classList.contains('transitioning')).toBe(false);
  });

  it('slideUp uses default duration (300ms)', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetHeight', { get: () => 60 });

    slideUp(el); // no duration -> default 300ms

    expect(el.style.transitionDuration).toBe('300ms');
    jest.advanceTimersByTime(300);
    expect(el.style.transitionDuration).toBe('');
    expect(el.classList.contains('transitioning')).toBe(false);
  });

  it('slideToggle uses default duration when not provided', () => {
    jest.resetModules();
    const slideDownMock = jest.fn();
    const slideUpMock = jest.fn();

    jest.doMock('@ui/composables/slideDown', () => ({ __esModule: true, default: slideDownMock }));
    jest.doMock('@ui/composables/slideUp', () => ({ __esModule: true, default: slideUpMock }));

    const toggle = require('@ui/composables/slideToggle').default as typeof slideToggle;

    const elHidden = document.createElement('div');
    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValueOnce({ display: 'none' } as unknown as CSSStyleDeclaration)
      .mockReturnValueOnce({ display: 'block' } as unknown as CSSStyleDeclaration);

    toggle(elHidden); // no duration -> default 300 passed to slideDown
    expect(slideDownMock).toHaveBeenCalledWith(elHidden, 300);

    const elVisible = document.createElement('div');
    toggle(elVisible); // no duration -> default 300 passed to slideUp
    expect(slideUpMock).toHaveBeenCalledWith(elVisible, 300);
  });
});
