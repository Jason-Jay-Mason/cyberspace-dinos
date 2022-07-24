import { getBoundedRandom } from '../utils/game-utils'

function getTurnDirection(a, b) {
  if (
    (a <= Math.PI && b <= Math.PI && a > b) ||
    (b >= Math.PI && a >= Math.PI && a > b) ||
    (b >= (3 / 2) * Math.PI && a <= Math.PI / 2) ||
    (a <= (3 / 2) * Math.PI && a >= Math.PI && b <= Math.PI && b >= Math.PI / 2)
  ) {
    return 'left'
  } else {
    return 'right'
  }
}

export class Ai {
  constructor(player) {
    this.player = player
    this.inputs = this.player.dinoRadar
    this.currentAction = null
    this.actionState = null
    this.wallBoundary = 0.6
  }
  resetContoles() {
    this.player.controles.fire = 0
    this.player.controles.thrust = 0
    this.player.controles.left = 0
    this.player.controles.right = 0
  }
  clearAction() {
    this.actionState = null
    this.currentAction = null
  }

  avoidWall() {
    let p = this.player.dinoRadar

    //handle the state for this action
    if (this.actionState === null) {
      this.actionState = {
        direction: p.direction,
        turnDirection: null,
        turnComplete: false,
        thrustComplete: false,
      }
    }

    if (
      (p.xPosition < -this.wallBoundary && this.player.velocity.x < 0) ||
      (p.xPosition > this.wallBoundary && this.player.velocity.x > 0) ||
      (p.yPosition < -this.wallBoundary && this.player.velocity.y > 0) ||
      (p.yPosition > this.wallBoundary && this.player.velocity.y < 0)
    ) {
      // set turn direction

      if (this.actionState.turnDirection === null) {
        const a = this.player.rotation
        const b = p.oppositeDirection
        const direction = getTurnDirection(a, b)
        this.actionState.turnDirection = direction
      }

      //initiat the turn
      if (
        this.player.rotation < p.oppositeDirection - 0.2 ||
        this.player.rotation > p.oppositeDirection + 0.2
      ) {
        this.player.controles[this.actionState.turnDirection] = 1
      } else {
        this.player.controles[this.actionState.turnDirection] = 0
        this.actionState.turnComplete = true
      }

      //thrust away from wall
      if (this.actionState.turnComplete) {
        this.player.controles.thrust = 1
      }
    } else {
      this.clearAction()
      this.resetContoles()
    }

    //
  }

  destroyDino() {
    let p = this.player.dinoRadar
    let needsToTurn = this.checkWallBoundary()

    //aim at dino
    if (p.targetDistance < 0.2 && !needsToTurn) {
      if (p.xPosition > 0) {
        if (p.targetRadians > 3) {
          this.player.controles.left = 1
          this.player.controles.right = 0
        } else {
          this.player.controles.left = 0
          this.player.controles.right = 1
        }
      } else {
        if (p.targetRadians > 3) {
          this.player.controles.left = 1
          this.player.controles.right = 0
        } else {
          this.player.controles.left = 0
          this.player.controles.right = 1
        }
      }
      if (p.targetRadians < 0.7 || p.targetRadians > 6.2) {
        this.player.controles.fire = 1
      } else {
        this.player.controles.fire = 0
      }
    } else {
      this.resetContoles()
      this.clearAction()
    }
  }

  huntDino() {
    let p = this.player.dinoRadar
    //aim about dino
    if (p.targetRadians > 0.2 && p.targetRadians < 6.1) {
      if (p.targetRadians > Math.PI) {
        this.player.controles.left = 1
        this.player.controles.right = 0
      } else {
        this.player.controles.left = 0
        this.player.controles.right = 1
      }
    } else {
      this.player.controles.right = 0
      this.player.controles.left = 0
      if (
        p.netVelocity < 2.5 ||
        (this.player.rotation < p.oppositeDirection + 1 &&
          this.player.rotation > p.oppositeDirection - 1)
      ) {
        this.player.controles.thrust = 1
      } else {
        this.player.controles.thrust = 0
      }
    }
  }

  checkWallBoundary() {
    let p = this.player.dinoRadar
    if (
      (p.xPosition < -this.wallBoundary && this.player.velocity.x < 0) ||
      (p.xPosition > this.wallBoundary && this.player.velocity.x > 0) ||
      (p.yPosition < -this.wallBoundary && this.player.velocity.y > 0) ||
      (p.yPosition > this.wallBoundary && this.player.velocity.y < 0)
    ) {
      return true
    } else false
  }

  feed() {
    let p = this.player.dinoRadar
    if (this.currentAction === null) {
      //dont run into walls
      let needsToTurn = this.checkWallBoundary()
      if (needsToTurn) {
        this.currentAction = this.avoidWall
      } else if (p.targetDistance < 0.2) {
        this.currentAction = this.destroyDino
      } else if (p.targetDistance > 0.2) {
        this.huntDino()
      }
    } else {
      this.currentAction()
    }
  }
}
