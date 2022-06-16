export class Player {
  constructor({ controles, imgEl, width, height, position, rotation, thrust }) {
    this.imgEl = imgEl
    this.width = width
    this.height = height
    this.position = position
    this.rotation = rotation
    this.thrust = thrust
    this.boundaryPadding = 20
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.controles = controles
  }

  render(ctx) {
    ctx.shadowBlur = 17
    ctx.translate(this.position.x, this.position.y)
    ctx.shadowColor = 'rgba(255, 255, 255, 0.46)'
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

  update(ctx) {
    if (this.controles.thrust) {
      let factor = Math.pow(0.5, Math.abs(this.velocity.y + this.velocity.x))
      this.velocity.x =
        this.velocity.x +
        factor * (Math.cos(this.rotation - Math.PI / 2) * this.thrust)
      this.velocity.y =
        this.velocity.y +
        factor * (Math.sin(this.rotation - Math.PI / 2) * this.thrust)
    }
    if (
      this.position.y <= this.boundaryPadding &&
      Math.sign(this.velocity.y) === -1
    ) {
      this.velocity.y = (this.velocity.y / 2) * -1
    }
    if (
      this.position.y >= innerHeight - this.boundaryPadding &&
      Math.sign(this.velocity.y) === 1
    ) {
      this.velocity.y = (this.velocity.y / 2) * -1
    }
    if (
      this.position.x <= this.boundaryPadding &&
      Math.sign(this.velocity.x) === -1
    ) {
      this.velocity.x = (this.velocity.x / 2) * -1
    }
    if (
      this.position.x >= innerWidth - this.boundaryPadding &&
      Math.sign(this.velocity.x) === 1
    ) {
      this.velocity.x = (this.velocity.x / 2) * -1
    }
    if (this.controles.right && !this.controles.left) {
      this.rotation = this.rotation + 0.1
    } else if (this.controles.left && !this.controles.right) {
      this.rotation = this.rotation - 0.1
    }
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this.render(ctx)
  }
}
