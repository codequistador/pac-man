import Ember from 'ember';
import SharedStuff from '../mixins/shared-stuff';

export default Ember.Object.extend(SharedStuff, {
  direction: 'stopped',
  draw(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), '#ee3f46');
  },
});
