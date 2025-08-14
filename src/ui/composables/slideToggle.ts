import slideDown from '@ui/composables/slideDown';
import slideUp from '@ui/composables/slideUp';

const slideToggle = (elm: HTMLElement, duration: number = 300) => {
  if (window.getComputedStyle(elm).display === 'none') {
    slideDown(elm, duration);
  } else {
    slideUp(elm, duration);
  }
};

export default slideToggle;
