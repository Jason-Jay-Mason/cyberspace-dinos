import { Player } from './player'

export class PlayerSpawner {
  constructor({ amount, playerImg, laserImg }) {
    this.amount = amount
    this.playerImg = playerImg
    this.laserImg = laserImg
    this.players = {}
    this.playerKeys = []
    this.playerValues = []
    this.highestScore = 10
    this.bestPlayer
  }

  createPlayers(frame) {
    this.playerKeys = Object.keys(this.players)
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
        isAi: true,
        dinoCount: this.dinoCount,
        startScore: this.bestPlayer ? this.bestPlayer.score : 0,
      })
      //add the dino to the dinosaurs object
      this.players[frame] = player
    }
  }

  update(frame) {
    if (this.playerKeys.length < this.amount) {
      this.createPlayers(frame)
    }
  }
}
