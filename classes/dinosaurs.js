import { Dinosaur } from '../classes/dinosaur'
import { getBoundedRandom } from '../utils/game-utils'

export class DinosaurSpawner {
  constructor({ amount, images }) {
    this.amount = amount
    this.images = images
    this.positions
    this.dinosaurs = {}
    this.dinoKeys = []
    this.spawnPlace = 1
    this.lastSpawnTime = null
  }
  getSpawnPoint() {
    const imageIndex = Math.round(getBoundedRandom(0, this.images.length - 1))
    const spawnPadding = 40
    let spawnPosition
    let spawnVelocity
    switch (this.spawnPlace) {
      case 1:
        spawnPosition = {
          x: getBoundedRandom(0.2, 0.8) * innerWidth,
          y: 0 - spawnPadding,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.1, 0.1),
          y: getBoundedRandom(0.3, 0.8),
        }
        break
      case 2:
        spawnPosition = {
          x: getBoundedRandom(0.2, 0.8) * innerWidth,
          y: innerHeight + spawnPadding,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.1, 0.1),
          y: getBoundedRandom(-0.3, -0.8),
        }
        break
      case 3:
        spawnPosition = {
          x: 0 - spawnPadding,
          y: getBoundedRandom(0.2, 0.8) * innerHeight,
        }
        spawnVelocity = {
          x: getBoundedRandom(0.3, 0.8),
          y: getBoundedRandom(-0.1, 0.1),
        }
        break
      case 4:
        spawnPosition = {
          x: innerWidth + spawnPadding,
          y: getBoundedRandom(0.2, 0.8) * innerHeight,
        }
        spawnVelocity = {
          x: getBoundedRandom(-0.3, -0.8),
          y: getBoundedRandom(-0.1, 0.1),
        }
        break
    }

    this.spawnPlace === 4 ? (this.spawnPlace = 1) : this.spawnPlace++
    return { spawnPosition, spawnVelocity, imageIndex }
  }
  buildDinosaurs(frame) {
    //get the keys of the dinosaurs obj for looping
    this.dinoKeys = Object.keys(this.dinosaurs) || []

    //TODO delete this
    // let dinoPositions = []
    // this.dinoKeys.forEach((dinokey) => {
    //   dinoPositions.push(this.dinosaurs[dinokey].position.x)
    //   dinoPositions.push(this.dinosaurs[dinokey].position.y)
    // })
    // this.dinoPositions = dinoPositions

    //only create new dinosaurs if there are not enough
    if (
      (this.dinoKeys.length < this.amount &&
        this.lastSpawnTime + 1000 < frame) ||
      this.dinoKeys.length === 0
    ) {
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
        rotationVelocity: getBoundedRandom(-0.02, 0.02),
        width: this.images[imageIndex].width,
        height: this.images[imageIndex].height,
      })

      this.lastSpawnTime = frame
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
