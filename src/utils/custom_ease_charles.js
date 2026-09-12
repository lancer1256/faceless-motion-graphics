import { gsap } from 'gsap';
import { CustomEase } from './../../node_modules/gsap/CustomEase.js';

gsap.registerPlugin(CustomEase);

CustomEase.create("custom_ease_charles", "M0,0 C0.31,0.00 0.09,1.00 1,1");

export default "custom_ease_charles"; 
