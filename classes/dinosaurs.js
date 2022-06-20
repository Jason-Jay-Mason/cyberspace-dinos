import { Dinosaur } from '../classes/dinosaur'
import { getBoundedRandom } from '../utils/game-utils'

export class Dinosaurs {
  constructor({ amount, images }) {
    this.amount = amount
    this.images = images
    this.dinosaurs = {}
  }
  buildDinosaurs(frame) {
    const dinosaursKeys = Object.keys(this.dinosaurs) || []
    if (dinosaursKeys.length < this.amount) {
      const dinosaur = new Dinosaur({
        imgEl: this.images[0],
        rotation: 0.2,
        position: {
          x: getBoundedRandom(40, innerWidth - 40),
          y: getBoundedRandom(40, innerHeight - 40),
        },
        velocity: {
          x: getBoundedRandom(-0.5, 0.5),
          y: getBoundedRandom(-0.5, 0.5),
        },
        rotationVelocity: getBoundedRandom(-0.007, 0.007),
        width: 130,
        height: 139,
      })
      this.dinosaurs[frame] = dinosaur
    }
  }

  update(ctx, frame) {
    this.buildDinosaurs(frame)
  }
}
