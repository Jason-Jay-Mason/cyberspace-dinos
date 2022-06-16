import { Controles } from './controles.js'
import { Laser } from './laser'
export class Player {
  constructor({ imgEl, laserImg, width, height, position, rotation, thrust }) {
    this.imgEl = imgEl
    this.laserImg = laserImg
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
    this.controles = new Controles()
    this.lasers = {}
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

  update(ctx, frame) {
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

    //update lasers
    //get the keys of the lasers object
    let laserKeys = Object.keys(this.lasers)
    //get the frame that the last laser was fired
    let lastLaserFrame = parseInt(laserKeys[laserKeys.length - 1]) || -10
    //see if the fire button is pushed and if the gun is ready to shoot again
    if (this.controles.fire && lastLaserFrame + 10 < frame) {
      const rotation = this.rotation
      //set the position that the laser appears relative to this player
      const position = {
        x: this.position.x - Math.cos(rotation - 0.2 + Math.PI / 2) * 18,
        y: this.position.y - Math.sin(rotation - 0.2 + Math.PI / 2) * 18,
      }
      //create a new laser and append it to the lasers obj
      const laser = new Laser({
        imgEl: this.laserImg,
        rotation: rotation,
        position: position,
      })
      this.lasers[frame] = laser
    }

    //if there are current lasers, then update their position and delete them if they are off screen
    laserKeys &&
      laserKeys.forEach((laser) => {
        if (this.lasers[laser].position.y <= 0) {
          delete this.lasers[laser]
        }
        if (this.lasers[laser]) {
          this.lasers[laser].update(ctx)
        }
      })

    this.render(ctx)
  }
}
