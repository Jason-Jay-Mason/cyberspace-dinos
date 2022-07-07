import { Network } from './network'
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
    this.highestScore = 10
    this.bestPlayer
    this.loading = false
  }
  async saveNetwork(network) {
    const res = await fetch('/api/network/', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(network),
    })
    const json = await res.json()
    console.log(json)
  }
  async loadNetwork() {
    const res = await fetch('/api/network/')
    const network = await res.json()
    return network
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
    if (this.bestPlayer.score > this.highestScore) {
      this.highestScore = this.bestPlayer.score
      this.bestPlayer.score = 0
      this.saveNetwork(this.bestPlayer.ai)
    }
    this.playerKeys.forEach((playerKey) => {
      if (this.players[playerKey].score + 1000 < this.bestPlayer.score) {
        delete this.players[playerKey]
      }
    })
  }
  async createPlayers(frame) {
    this.loading = true
    //only create new players if there are not enough
    if (this.playerKeys.length < this.amount) {
      //load best network
      const res = await this.loadNetwork()

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
        network: res.network ? JSON.parse(res.network) : null,
      })
      //add the dino to the dinosaurs object
      this.players[frame] = player
      this.loading = false
    }
  }

  update(frame) {
    this.deletePlayers()
    if (this.playerKeys.length < this.amount && this.loading === false) {
      this.createPlayers(frame)
    }
  }
}
