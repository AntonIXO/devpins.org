import { bindPageMotion } from './in-view';
import './cv-orb';

document.addEventListener('astro:page-load', () => {
	bindPageMotion();
});

