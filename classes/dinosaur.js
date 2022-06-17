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
  render(ctx) {
    ctx.resetTransform()
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.rotation)

    ctx.drawImage(
      this.imgEl,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    )
    ctx.resetTransform()
  }
  update(ctx, player) {
    this.handleBorders()
    this.position.x = this.position.x + this.velocity.x
    this.position.y = this.position.y + this.velocity.y
    this.rotation += this.rotationVelocity
    this.render(ctx)
  }
}
