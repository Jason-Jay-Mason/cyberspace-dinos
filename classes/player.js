import { Controles } from './controles.js'
import { Laser } from './laser'
import { Sprite } from './sprite'

export class Player extends Sprite {
  constructor({ imgEl, laserImg, width, height, position, rotation, thrust }) {
    //sprite props
    super({
      spriteIndex: {
        x: 0,
        y: 0,
      },
      crop: {
        x: 280,
        y: 200,
      },
      currentSprite: {
        x: 0,
        y: 0,
      },
      updateFrame: 0,
    })
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
    this.score = 0
    this.thrusterLengnth = 0
  }

  activatePrimaryThrusters() {
    let factor = Math.pow(0.7, Math.abs(this.velocity.y + this.velocity.x))
    this.velocity.x =
      this.velocity.x +
      factor * (Math.cos(this.rotation - Math.PI / 2) * this.thrust)
    this.velocity.y =
      this.velocity.y +
      factor * (Math.sin(this.rotation - Math.PI / 2) * this.thrust)
  }
  activateRotationThrusters() {
    if (this.controles.right && !this.controles.left) {
      this.rotation = this.rotation + 0.07
    } else if (this.controles.left && !this.controles.right) {
      this.rotation = this.rotation - 0.07
    }
  }
  fireLaser(frame) {
    let laserKeys = Object.keys(this.lasers)
    //get the frame that the last laser was fired
    let lastLaserFrame = parseInt(laserKeys[laserKeys.length - 1]) || -10
    //see if the fire button is pushed and if the gun is ready to shoot again
    if (lastLaserFrame + 10 < frame) {
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
  }
  updateLaserPositions(ctx) {
    //update lasers
    //get the keys of the lasers object
    let laserKeys = Object.keys(this.lasers)

    //if there are current lasers, then update their position and delete them if they are off screen
    laserKeys &&
      laserKeys.forEach((laser) => {
        let laserValue = this.lasers[laser]
        if (laserValue.position.y < 0) {
          delete this.lasers[laser]
          return
        }
        if (laserValue.position.y > innerHeight) {
          delete this.lasers[laser]
          return
        }
        if (laserValue.position.x < 0) {
          delete this.lasers[laser]
          return
        }
        if (laserValue.position.x > innerWidth) {
          delete this.lasers[laser]
          return
        }
        if (this.lasers[laser]) {
          this.lasers[laser].update(ctx)
        }
      })
  }

  handleCanvasBoundaries() {
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
  }

  updateShipPosition() {
    this.handleCanvasBoundaries()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }

  controleShip(frame) {
    if (this.controles.left || this.controles.right) {
      this.activateRotationThrusters()
    }
    if (this.controles.thrust) {
      this.activatePrimaryThrusters()
    }
    if (this.controles.fire) {
      this.fireLaser(frame)
    }
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
    if (!this.controles.thrust && this.thrusterLengnth !== 0) {
      this.thrusterLengnth = 0
    }
    if (this.controles.thrust) {
      this.thrusterLengnth += 1
      let colorStop = 1 - 1 / this.thrusterLengnth
      ctx.translate(-this.width / 5.2, this.height / 2)
      let grd = ctx.createLinearGradient(
        this.width / 2 / 2,
        0,
        this.width / 2 / 2,
        this.height / 2.5
      )
      grd.addColorStop(0, `rgba(206, 77, 69, ${colorStop})`)
      grd.addColorStop(colorStop.toFixed(2), 'rgba(206, 77, 69, 0)')
      ctx.fillStyle = grd

      ctx.fillRect(0, 0, this.width / 2, this.height / 2.5)
    }

    ctx.resetTransform()
  }

  update(ctx, frame) {
    this.controleShip(frame)
    this.updateShipPosition()
    this.updateLaserPositions(ctx)

    this.render(ctx)
  }
}
