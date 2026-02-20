
import { spielBlock } from "../state.js";

//позиции разных врагов
export const enemys = [
{ x: 17 * spielBlock, y: 1 * spielBlock, size: 0.9, speed: 0.2, achse: 'x', art: 'scull' },
{ x: 19 * spielBlock, y: 17 * spielBlock,size: 0.8, speed: 0.5, achse: 'x', art: 'scull' },
{ x: 3 * spielBlock, y: 13 * spielBlock,size: 0.8, speed: 0.7, achse: 'y', art: 'scull'},
{ x: 9 * spielBlock, y: 11 * spielBlock,size: 0.8, speed: 0.6, achse: 'y',art: 'scull' },
{ x: 25 * spielBlock, y: 7 * spielBlock,size: 0.8, speed: 0.4, achse: 'x', art: 'scull' },
{ x: 19 * spielBlock, y: 3 * spielBlock,size: 0.8, speed: 0.5, achse: 'x', art: 'ghost'},
{ x: 11 * spielBlock, y: 3 * spielBlock,size: 0.8, speed: 0.6, achse: 'y', art: 'ghost'},
{ x: 29 * spielBlock, y: 9 * spielBlock,size: 0.8, speed: 0.6, achse: 'x', art: 'ghost'},
{ x: 31 * spielBlock, y: 13 * spielBlock,size: 0.8, speed: 0.6, achse: 'y', art: 'ghost'},
{ x: 11 * spielBlock, y: 13 * spielBlock,size: 0.8, speed: 0.6, achse: 'x', art: 'ghost'},
{ x: 13 * spielBlock, y: 5 * spielBlock,size: 0.8, speed: 0.2, achse: 'x', art: 'ghost'},
{ x: 1 * spielBlock, y: 1 * spielBlock,size: 0.8, speed: 0.8, achse: 'y', art: 'ghost'},
{ x: 3 * spielBlock, y: 19 * spielBlock,size: 0.8, speed: 0.65, achse: 'y', art: 'ghost'},
]
