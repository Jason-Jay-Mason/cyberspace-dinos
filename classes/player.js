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
    startScore,
    network,
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
    this.score = startScore
    this.thrusterLengnth = 0
    this.dinoRadar = [innerWidth, innerHeight]
    this.isAi = playerType == 'ai'
    if (network) {
      this.ai = network
    } else {
      this.ai = new Network({
        training: true,
        inputCount: 10,
        outputCount: 4,
        hiddenLayers: 1,
        hiddenLayerInputCount: 7,
      })
    }
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
      this.score -= 10
      this.velocity.y = (this.velocity.y / 2) * -1
    }
    if (
      this.position.y >= innerHeight - this.boundaryPadding &&
      Math.sign(this.velocity.y) === 1
    ) {
      this.score -= 10
      this.velocity.y = (this.velocity.y / 2) * -1
    }
    if (
      this.position.x <= this.boundaryPadding &&
      Math.sign(this.velocity.x) === -1
    ) {
      this.score -= 10
      this.velocity.x = (this.velocity.x / 2) * -1
    }
    if (
      this.position.x >= innerWidth - this.boundaryPadding &&
      Math.sign(this.velocity.x) === 1
    ) {
      this.score -= 10
      this.velocity.x = (this.velocity.x / 2) * -1
    }
  }

  updateShipPosition() {
    this.handleCanvasBoundaries()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }

  controleShip(frame) {
    if (this.ai && this.ai.training === false) {
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

    //input patern will be:
    // [1.(player distance to x screen bound),
    // 2.(player distance to y screen bound),
    // 3.(player velocity x),
    // 4. (player velocity y),
    // 5. (closestDino rotation),
    // 6. (closestDino x),
    // 7. (closestDino y),
    // 8. (oldestDino rotation),
    // 9. (oldestDino x),
    // 10.(oldestDino y)]

    //adding the distance to the edges of the screen
    let x =
      Math.abs(this.position.x - innerWidth / 2) -
      innerWidth / 2 +
      this.boundaryPadding
    let y =
      Math.abs(this.position.y - innerHeight / 2) -
      innerHeight / 2 +
      this.boundaryPadding

    final.push(x)
    final.push(y)

    //pushing in the velocity
    final.push(this.velocity.x)
    final.push(this.velocity.y)

    // we want to get the closest dino and the oldest dino to target, and ignore the rest because we want the number of inputs to be constant and not dependant on the number of dinos
    if (dinoValues.length) {
      const closestDino = dinoValues.reduce((closestDino, dino) => {
        if (dino.playerDistance < closestDino) {
          return dino
        }
        return closestDino
      })
      //get the oldest dino
      const oldestDino = dinoValues[0]
      const targets = [closestDino, oldestDino]

      targets.forEach((dino) => {
        //get the distance to the dino relative to ship position on the cartesian plane
        let dinox = dino.position.x - this.position.x
        let dinoy = this.position.y - dino.position.y

        //get the position in radians that the dino is relative to the ship
        let rotation = Math.atan(dinox / dinoy)
        //since arch tan returns a radian as a element of {R: r >-pi/2<pi/2} it is more usefull to let the radian be an element of {R: r>0<2PI}
        if (dinoy < 0) {
          rotation = Math.PI + rotation
        }
        if (dinoy > 0 && dinox < 0) {
          rotation = (7 / 4) * Math.PI + rotation
        }
        let radiansToTarget = rotation - this.rotation

        final.push(radiansToTarget)
        final.push(dinox)
        final.push(dinoy)
      })

      this.dinoRadar = final
    }
  }

  fitness() {
    if (this.velocity.x == 0 && this.velocity.y == 0) {
      this.score -= 0.1
    }
    const centerBoarders = {
      left: innerWidth / 2 - innerWidth * 0.25,
      right: innerWidth / 2 + innerWidth * 0.25,
      bottom: innerHeight / 2 + innerHeight * 0.25,
      top: innerHeight / 2 - innerHeight * 0.25,
    }
    if (
      this.position.x > centerBoarders.left &&
      this.position.x < centerBoarders.right &&
      this.position.y > centerBoarders.top &&
      this.position.y < centerBoarders.bottom
    ) {
      this.score -= 0.1
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

  async trainAi(network) {
    this.ai.trainingInProgress = true
    const res = await fetch('/api/train-network', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(network),
    })
    const newNetwork = await res.json()
    console.log(newNetwork)
    this.ai.costFrames = []
    this.ai.trainingInProgress = false
  }

  update(ctx, frame, dinosaurs) {
    this.controleShip(frame)
    // perform ml stuff here
    if (this.isAi) {
      //get the inputs for the network
      this.radarDectector(dinosaurs)

      //feed those new inputs to the network
      const network = Network.feed(this.dinoRadar, this.ai)

      if (this.ai.training) {
        if (!this.ai.trainingInProgress) {
          const trainingData = Object.values(this.controles)
          const newNetwork = Network.getCosts({
            trainingData,
            network: this.ai,
          })
          if (newNetwork.costFrames.length > 10) {
            this.trainAi(newNetwork)
          } else {
            this.ai = newNetwork
          }
        }
      } else {
        this.ai = network
        this.controles = this.ai.outputs
      }
    }

    this.updateShipPosition()
    this.updateLaserPositions(ctx)

    this.render(ctx)
  }
}
