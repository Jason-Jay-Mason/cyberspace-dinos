import { getBoundedRandom } from '../utils/game-utils'
import { Sprite } from './sprite'

function generateExplosionArray() {
  let final = []
  for (let i = 0; i < 70; i++) {
    let rotation = Math.random() * Math.PI
    let color =
      Math.random() < 0.8 ? 'rgba(252, 206, 94,' : 'rgba(255, 255, 255,'
    let speed =
      color === 'rgba(252, 206, 94,'
        ? getBoundedRandom(0.08, 0.6)
        : getBoundedRandom(0.2, 2)
    let width =
      color === 'rgba(252, 206, 94,'
        ? getBoundedRandom(0.5, 1.5)
        : getBoundedRandom(3, 5)
    let height =
      color === 'rgba(252, 206, 94,'
        ? getBoundedRandom(5, 10)
        : getBoundedRandom(5, 20)
    let yVelocityMultiplyer =
      color === 'rgba(252, 206, 94,' ? 0 : getBoundedRandom(-0.5, 0.5)

    final.push({
      rotation,
      color,
      speed,
      width,
      height,
      yVelocityMultiplyer,
    })
  }

  return final
}

export class Dinosaur extends Sprite {
  constructor({
    imgEl,
    rotation,
    position,
    velocity,
    rotationVelocity,
    width,
    height,
  }) {
    //sprite props
    super({
      spriteIndex: {
        x: 0,
        y: 0,
      },
      crop: {
        x: 100,
        y: 100,
      },
      currentSprite: {
        x: 0,
        y: 0,
      },
      updateFrame: 0,
    })
    this.imgEl = imgEl
    this.rotation = rotation
    this.rotationVelocity = rotationVelocity
    this.position = position
    this.velocity = velocity
    this.width = width
    this.height = height
    this.borderPadding = 40
    this.destroyedFrame = null
    this.explosionVelocity = 2
    this.explosionParticles = generateExplosionArray()
    this.playerDistance = 0
    this.collision = false
  }

  handleAnimate(frame) {
    if (this.updateFrame + 700 < frame) {
      this.updateFrame = frame
      this.currentSprite.x = this.spriteIndex.x * this.crop.x
      if (this.spriteIndex.x >= 1) {
        this.spriteIndex.x = 0
      } else {
        this.currentSprite.x = this.spriteIndex.x * this.crop.x
        this.spriteIndex.x += 1
      }
    }
  }
  handleBorders() {
    if (
      this.position.y < this.borderPadding &&
      Math.sign(this.velocity.y) === -1
    ) {
      this.velocity.y = this.velocity.y * -1
    }
    if (
      this.position.y > innerHeight - this.borderPadding &&
      Math.sign(this.velocity.y) === 1
    ) {
      this.velocity.y = this.velocity.y * -1
    }
    if (
      this.position.x > innerWidth - this.borderPadding &&
      Math.sign(this.velocity.x) === 1
    ) {
      this.velocity.x = this.velocity.x * -1
    }
    if (
      this.position.x < this.borderPadding &&
      Math.sign(this.velocity.x) === -1
    ) {
      this.velocity.x = this.velocity.x * -1
    }
  }
  updateDinoPosition() {
    this.handleBorders()
    this.position.x = this.position.x + this.velocity.x
    this.position.y = this.position.y + this.velocity.y
    this.rotation += this.rotationVelocity
  }

  destroyAnimation(ctx, frame) {
    //check to see if this is the first time the function has run on this dino and if so, set the update frame to 0
    if (this.destroyedFrame === frame) {
      this.updateFrame = 0
    }
    //reset the transform on the context obj
    ctx.resetTransform()
    //translate the ctx to the dino's position
    ctx.translate(this.position.x, this.position.y)

    //loop through the explosion particles and display them on screen
    for (let i = 0; i < this.explosionParticles.length; i++) {
      ctx.rotate(this.explosionParticles[i].rotation)
      //get an opacity value for fadding the particles out
      let opacity = 200 / Math.pow(this.updateFrame, 2.6)
      // set the particle fill color pased on the opacity
      ctx.fillStyle = `${this.explosionParticles[i].color}${opacity.toFixed(
        2
      )})`
      //create the rectangle on screen the +32 is for padding
      ctx.fillRect(
        (this.updateFrame * this.explosionVelocity) /
          this.explosionParticles[i].speed +
          32,
        this.updateFrame *
          this.explosionVelocity *
          this.explosionParticles[i].yVelocityMultiplyer,
        this.explosionParticles[i].height,
        this.explosionParticles[i].width
      )
    }

    this.updateFrame += 1
    ctx.resetTransform()
  }

  render(ctx) {
    ctx.resetTransform()

    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.rotation)
    ctx.shadowColor = 'rgba(255, 255, 255, 0.46)'

    ctx.drawImage(
      this.imgEl,
      this.currentSprite.x,
      this.currentSprite.y,
      this.crop.x,
      this.crop.y,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    )
    ctx.resetTransform()
  }

  update(ctx, frame) {
    //check to see if the dino has been shot by a laser
    if (!this.destroyedFrame) {
      //if not, hanlde the normal animations
      this.handleAnimate(frame)
      this.updateDinoPosition()
      this.render(ctx)
    } else {
      //if the dino has been shot, play the destroy animation
      this.destroyAnimation(ctx, frame)
      this.updateDinoPosition()
    }
  }
}
