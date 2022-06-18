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
  renderDinos(ctx, player) {
    const dinosaursKeys = Object.keys(this.dinosaurs) || []
    const laserKeys = Object.keys(player.lasers)

    dinosaursKeys.forEach((dinoKey) => {
      laserKeys.length &&
        laserKeys.forEach((laserKey) => {
          if (this.dinosaurs[dinoKey] && player.lasers[laserKey]) {
            const distance = Math.hypot(
              player.lasers[laserKey].position.x -
                this.dinosaurs[dinoKey].position.x,
              player.lasers[laserKey].position.y -
                this.dinosaurs[dinoKey].position.y
            )
            if (distance < 40) {
              delete player.lasers[laserKey]
              delete this.dinosaurs[dinoKey]
              return
            }
          }
        })
      if (this.dinosaurs[dinoKey]) {
        this.dinosaurs[dinoKey].update(ctx, player)
      }
    })
  }
  update(ctx, frame, player) {
    this.buildDinosaurs(frame)
    this.renderDinos(ctx, player)
  }
}
