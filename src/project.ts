import { makeProject } from '@motion-canvas/core';
import hook from './scenes/hook?scene';
import two from './scenes/2?scene';
import three from './scenes/3?scene';
import four from './scenes/4?scene';
import five from './scenes/5?scene';
import six from './scenes/6?scene';

import log from './scenes/log?scene';
import outro from './scenes/outro?scene';


export default makeProject({
  scenes: [hook, two, three, four, five, log, six, outro],
}); 