import { bindThemeControls } from './theme';

document.addEventListener('astro:page-load', () => {
	bindThemeControls();
});
