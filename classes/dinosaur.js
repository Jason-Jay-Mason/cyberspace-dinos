import { getBoundedRandom } from '../utils/game-utils'

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
    let uniqueRotation =
      color === 'rgba(252, 206, 94,' ? 0 : getBoundedRandom(-0.5, 0.5)

    final.push({
      rotation,
      color,
      speed,
      width,
      height,
      uniqueRotation,
    })
  }

  return final
}
export class Dinosaur {
  constructor({
    imgEl,
    rotation,
    position,
    velocity,
    rotationVelocity,
    width,
    height,
  }) {
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
    //sprite props
    this.spriteIndex = {
      x: 0,
      y: 0,
    }
    this.crop = {
      x: 100,
      y: 100,
    }
    this.currentSprite = {
      x: 0,
      y: 0,
    }
    this.updateFrame = 0
  }

  // destroyAnimation(frame) {
  //   //move the y axis on the sprite down
  //   if (this.spriteIndex.y === 0) {
  //     this.spriteIndex.y += 1
  //     this.currentSprite.y = this.crop.y * this.spriteIndex.y
  //   }
  //   //go through each fram on the bottom of the sprite sheet
  //   if (this.updateFrame + 4 < frame) {
  //     this.currentSprite.x += this.crop.x
  //     this.updateFrame = frame
  //   }
  // }
  handleAnimate(frame) {
    // if (this.destroyedFrame) {
    //   this.destroyAnimation(frame)
    // } else {
    if (this.updateFrame + 30 < frame) {
      this.updateFrame = frame
      this.currentSprite.x = this.spriteIndex.x * this.crop.x
      if (this.spriteIndex.x >= 1) {
        this.spriteIndex.x = 0
      } else {
        this.currentSprite.x = this.spriteIndex.x * this.crop.x
        this.spriteIndex.x += 1
        // }
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
  render(ctx) {
    ctx.resetTransform()

    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.rotation)

    ctx.shadowBlur = 17
    if (this.destroyedFrame) {
      ctx.shadowBlur = 7
      ctx.shadowColor = 'rgba(255, 206, 94, 0.99)'
    } else {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.46)'
    }

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

  destroyAnimation(ctx, frame) {
    if (this.destroyedFrame === frame) {
      this.updateFrame = 0
    }
    ctx.resetTransform()
    ctx.translate(this.position.x, this.position.y)

    for (let i = 0; i < this.explosionParticles.length; i++) {
      ctx.rotate(this.explosionParticles[i].rotation)
      let opacity = this.destroyedFrame / Math.pow(this.updateFrame, 2.5)
      ctx.fillStyle = `${this.explosionParticles[i].color}${opacity.toFixed(
        2
      )})`
      ctx.fillRect(
        this.updateFrame / this.explosionParticles[i].speed + 32,
        this.updateFrame * this.explosionParticles[i].uniqueRotation,
        this.explosionParticles[i].height,
        this.explosionParticles[i].width
      )
    }

    this.updateFrame += this.explosionVelocity
    ctx.resetTransform()
  }

  update(ctx, player, frame) {
    if (!this.destroyedFrame) {
      this.handleAnimate(frame)
      this.updateDinoPosition()
      this.render(ctx)
    } else {
      this.destroyAnimation(ctx, frame)
      this.updateDinoPosition()
    }
  }
}
