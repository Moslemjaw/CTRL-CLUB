let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export function scrollToId(id) {
  const element = document.getElementById(id);
  if (!element) return;
  if (lenis) lenis.scrollTo(element, { duration: 1.6 });
  else element.scrollIntoView();
}
