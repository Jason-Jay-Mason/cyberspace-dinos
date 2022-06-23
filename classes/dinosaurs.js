import { Dinosaur } from '../classes/dinosaur'
import { getBoundedRandom } from '../utils/game-utils'

export class DinosaurSpawner {
  constructor({ amount, images }) {
    this.amount = amount
    this.images = images
    this.dinosaurs = {}
  }
  getSpawnPoint() {
    const spawnAxis = Math.random() < 0.5 ? 'x' : 'y'
    const spawnSide = Math.random()
    const spawnPadding = 40
    let spawnPosition
    let spawnVelocity
    if (spawnAxis === 'x') {
      if (spawnSide < 0.5) {
        spawnPosition = {
          x: Math.random() * innerWidth,
          y: 0 - spawnPadding,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.3, 0.3),
          y: getBoundedRandom(0.15, 0.5),
        }
      } else {
        spawnPosition = {
          x: Math.random() * innerWidth,
          y: innerHeight + spawnPadding,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.3, 0.3),
          y: getBoundedRandom(-0.15, -0.5),
        }
      }
    }
    if (spawnAxis === 'y') {
      if (spawnSide < 0.5) {
        spawnPosition = {
          x: 0 - spawnPadding,
          y: Math.random() * innerHeight,
        }
        spawnVelocity = {
          x: getBoundedRandom(0.15, 0.5),
          y: getBoundedRandom(-0.3, 0.3),
        }
      } else {
        spawnPosition = {
          x: innerWidth + spawnPadding,
          y: Math.random() * innerHeight,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.15, -0.5),
          y: getBoundedRandom(-0.3, 0.3),
        }
      }
    }

    return { spawnPosition, spawnVelocity }
  }
  buildDinosaurs(frame) {
    //get the keys of the dinosaurs obj for looping
    const dinosaursKeys = Object.keys(this.dinosaurs) || []
    //use this helper function to get a random spawn pint and velocity
    const { spawnPosition, spawnVelocity } = this.getSpawnPoint()
    //only create new dinosaurs if there are not enough
    if (dinosaursKeys.length < this.amount) {
      //create a new dino
      const dinosaur = new Dinosaur({
        imgEl: this.images[0],
        rotation: 0.2,
        position: {
          x: spawnPosition.x,
          y: spawnPosition.y,
        },
        velocity: {
          x: spawnVelocity.x,
          y: spawnVelocity.y,
        },
        rotationVelocity: getBoundedRandom(-0.007, 0.007),
        width: 100,
        height: 100,
      })
      //add the dino to the dinosaurs object
      this.dinosaurs[frame] = dinosaur
    }
  }

  update(ctx, frame) {
    this.buildDinosaurs(frame)
  }
}
