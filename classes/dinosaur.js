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
  destroyAnimation() {}
  handleAnimate(frame) {
    if (this.destroyedFrame) {
      this.destroyAnimation(frame)
    } else {
      if (this.updateFrame + 30 < frame) {
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

    ctx.drawImage(
      this.imgEl,
      this.currentSprite.x,
      0,
      this.crop.x,
      this.crop.y,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    )
    ctx.resetTransform()
  }
  update(ctx, player, frame) {
    this.handleAnimate(frame)
    this.updateDinoPosition()
    this.render(ctx)
  }
}
