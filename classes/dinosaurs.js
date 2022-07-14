import { Dinosaur } from '../classes/dinosaur'
import { getBoundedRandom } from '../utils/game-utils'

export class DinosaurSpawner {
  constructor({ amount, images }) {
    this.amount = amount
    this.images = images
    this.positions
    this.dinosaurs = {}
    this.dinoKeys = []
  }
  getSpawnPoint() {
    const spawnAxis = Math.random() < 0.5 ? 'x' : 'y'
    const spawnSide = Math.random()
    const imageIndex = Math.round(getBoundedRandom(0, this.images.length - 1))
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
          x: getBoundedRandom(-0.2, 0.2),
          y: getBoundedRandom(0.3, 0.8),
        }
      } else {
        spawnPosition = {
          x: Math.random() * innerWidth,
          y: innerHeight + spawnPadding,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.2, 0.2),
          y: getBoundedRandom(-0.3, -0.8),
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
          x: getBoundedRandom(0.3, 0.8),
          y: getBoundedRandom(-0.2, 0.2),
        }
      } else {
        spawnPosition = {
          x: innerWidth + spawnPadding,
          y: Math.random() * innerHeight,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.3, -0.8),
          y: getBoundedRandom(-0.2, 0.2),
        }
      }
    }

    return { spawnPosition, spawnVelocity, imageIndex }
  }
  buildDinosaurs(frame) {
    //get the keys of the dinosaurs obj for looping
    this.dinoKeys = Object.keys(this.dinosaurs) || []

    let dinoPositions = []
    this.dinoKeys.forEach((dinokey) => {
      dinoPositions.push(this.dinosaurs[dinokey].position.x)
      dinoPositions.push(this.dinosaurs[dinokey].position.y)
    })
    this.dinoPositions = dinoPositions

    //only create new dinosaurs if there are not enough
    if (this.dinoKeys.length < this.amount) {
      //use this helper function to get a random spawn pint and velocity
      const { spawnPosition, spawnVelocity, imageIndex } = this.getSpawnPoint()
      //create a new dino
      const dinosaur = new Dinosaur({
        imgEl: this.images[imageIndex].image,
        rotation: 0.2,
        position: {
          x: spawnPosition.x,
          y: spawnPosition.y,
        },
        velocity: {
          x: spawnVelocity.x,
          y: spawnVelocity.y,
        },
        rotationVelocity: getBoundedRandom(-0.01, 0.01),
        width: this.images[imageIndex].width,
        height: this.images[imageIndex].height,
      })
      //add the dino to the dinosaurs object
      this.dinosaurs[frame] = dinosaur
    }
  }
  updateDinos(ctx, frame) {
    this.dinoKeys.forEach((dinoKey) => {
      this.dinosaurs[dinoKey].update(ctx, frame)
      if (
        this.dinosaurs[dinoKey].destroyedFrame !== null &&
        this.dinosaurs[dinoKey].destroyedFrame + 340 < frame
      ) {
        delete this.dinosaurs[dinoKey]
      }
    })
  }

  update(ctx, frame) {
    this.buildDinosaurs(frame)
    this.updateDinos(ctx, frame)
  }
}
