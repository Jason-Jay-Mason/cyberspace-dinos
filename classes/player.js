import { Controles } from './controles.js'
import { Laser } from './laser'
import { Sprite } from './sprite'
import { Network } from './network'

export class Player extends Sprite {
  constructor({
    imgEl,
    laserImg,
    width,
    height,
    position,
    rotation,
    thrust,
    playerType,
    dinoCount,
  }) {
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
    this.controles = new Controles(playerType)
    this.lasers = {}
    this.score = 0
    this.thrusterLengnth = 0
    this.dinoRadar = [innerWidth, innerHeight]
    this.isAi = playerType == 'ai'
    this.ai = new Network({
      inputCount: dinoCount * 2 + 3,
      outputCount: 4,
      hiddenLayers: 2,
      hiddenLayerInputCount: dinoCount * 2 + 3,
    })
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
  activateRotationThrusters(direction) {
    if (direction == 'right') {
      //add 0.07 radians to the rotatation with modulo so that values do not become greater than Tau radians
      this.rotation = (this.rotation % (2 * Math.PI)) + 0.07
    } else if (direction == 'left') {
      //add this conditional to make the rotation not drop below 0 radians, this will help the neuro network train faster theoreticaly
      if (this.rotation <= 0) {
        this.rotation = this.rotation + 2 * Math.PI
      }
      //subtract 0.07 radians from the rotation
      this.rotation = this.rotation - 0.07
    }
  }
  fireLaser(frame) {
    let laserKeys = Object.keys(this.lasers)
    //get the frame that the last laser was fired
    let lastLaserFrame = parseInt(laserKeys[laserKeys.length - 1]) || -10
    //see if the fire button is pushed and if the gun is ready to shoot again
    if (lastLaserFrame + 170 < frame) {
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
    if (this.ai) {
      this.controles.left = this.ai.outputs[0]
      this.controles.right = this.ai.outputs[1]
      this.controles.thrust = this.ai.outputs[2]
      this.controles.fire = this.ai.outputs[3]
    }
    if (this.controles.left) {
      this.activateRotationThrusters('left')
    }
    if (this.controles.right) {
      this.activateRotationThrusters('right')
    }
    if (this.controles.thrust) {
      this.activatePrimaryThrusters()
    }
    if (this.controles.fire) {
      this.fireLaser(frame)
    }
  }
  radarDectector(dinosaurs) {
    let final = []
    const dinoValues = Object.values(dinosaurs)
    //go through the dinos and add their data to the radar in a usefull way
    dinoValues.forEach((dino, i) => {
      //get the distance to the dino relative to ship position on the cartesian plane
      let dinox = dino.position.x - this.position.x
      let dinoy = this.position.y - dino.position.y

      //target the oldest dinosaur by passing the amount of radians the ship needs to rotate in order to shoot the dino
      if (i === 0) {
        //get the position in radians that the dino is relative to the ship
        let rotation = Math.atan(dinox / dinoy)
        //since arch tan returns a radian as a element of {R: r >-pi/2<pi/2} it is more usefull to let the radian be an element of {R: r>0<2PI}
        if (dinoy < 0) {
          rotation = Math.PI + rotation
        }
        if (dinoy > 0 && dinox < 0) {
          rotation = (7 / 4) * Math.PI + rotation
        }
        let target = rotation - this.rotation
        final.push(target)
      }
      //add dino x,y positions relative to this player
      final.push(dinox)
      final.push(dinoy)
      //there are 3*dinos + 1 outputs form this that get added to the radar
    })
    //need to add the boundaries to the radar
    let y =
      Math.abs(this.position.y - innerHeight / 2) -
      innerHeight / 2 +
      this.boundaryPadding
    let x =
      Math.abs(this.position.x - innerWidth / 2) -
      innerWidth / 2 +
      this.boundaryPadding
    final.push(Math.abs(x))
    final.push(Math.abs(y))

    // //finally push the rotation to the radar
    // final.push(this.rotation)

    // dinoRadar.length = dinovalues.length*3 + 2(boundaries) + 1(rotation) + 1(targeted dino) = dinovalues.length*3 + 4
    this.dinoRadar = final
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

  update(ctx, frame, dinosaurs) {
    if (this.isAi) {
      this.radarDectector(dinosaurs)
      const outputs = Network.feed(this.dinoRadar, this.ai)
      this.ai.outputs = outputs
    }

    this.controleShip(frame)
    this.updateShipPosition()
    this.updateLaserPositions(ctx)

    this.render(ctx)
  }
}
