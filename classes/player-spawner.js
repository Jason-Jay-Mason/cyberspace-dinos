import { Player } from './player'

export class PlayerSpawner {
  constructor({ amount, playerImg, laserImg, dinoCount }) {
    this.amount = amount
    this.playerImg = playerImg
    this.laserImg = laserImg
    this.dinoCount = dinoCount
    this.players = {}
    this.playerKeys = []
    this.playerValues = []
    this.highScore = 0
    this.bestPlayer
  }
  deletePlayers() {
    this.playerKeys = Object.keys(this.players) || []
    if (this.playerKeys.length == 0) {
      return
    }
    this.playerValues = Object.values(this.players)
    this.bestPlayer = this.playerValues.reduce((best, player) => {
      if (best.score < player.score) {
        return player
      }
      return best
    })
    this.playerKeys.forEach((playerKey) => {
      if (this.players[playerKey].score + 10 < this.bestPlayer.score) {
        delete this.players[playerKey]
      }
    })
  }
  createPlayers(frame) {
    //only create new players if there are not enough
    if (this.playerKeys.length < this.amount) {
      //create a new player
      const player = new Player({
        imgEl: this.playerImg,
        laserImg: this.laserImg,
        width: 25,
        height: 22,
        position: {
          x: innerWidth / 2,
          y: innerHeight / 2,
        },
        rotation: 0,
        thrust: 0.09,
        playerType: 'ai',
        dinoCount: this.dinoCount,
        startScore: this.bestPlayer ? this.bestPlayer.score : 0,
      })
      //add the dino to the dinosaurs object
      this.players[frame] = player
    }
  }

  update(frame) {
    this.deletePlayers()
    this.createPlayers(frame)
  }
}
