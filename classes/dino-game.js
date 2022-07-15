import { DinosaurSpawner } from '../classes/dinosaurs'
import { PlayerSpawner } from '../classes/player-spawner'

export class DinoGame {
  constructor({ dinosaurCount, context }) {
    this.dinosaurCount = dinosaurCount
    this.dinosaurSpawner = {}
    this.playerSpawner = {}
    this.ctx = context
    this.initialize()
  }

  initialize() {
    // create the image elements for all the object in the game
    const playerImg = new Image()
    playerImg.src = '/j-ship-6.svg'

    const laserImg = new Image()
    laserImg.src = '/laser.svg'

    const wordPressRex = new Image()
    wordPressRex.src = '/wordpress-rex.svg'
    const wixRaptor = new Image()
    wixRaptor.src = '/wix-raptor.svg'
    const dinoImages = [
      { image: wixRaptor, width: 90, height: 90 },
      { image: wordPressRex, width: 110, height: 110 },
    ]

    //generate an object with dinosaurs with a key equal to the created frame, the amount is the max amount of dinos that will be on screen
    const dinosaurSpawner = new DinosaurSpawner({
      amount: this.dinosaurCount ? this.dinosaurCount : 1,
      images: dinoImages,
    })
    this.dinosaurSpawner = dinosaurSpawner

    const playerSpawner = new PlayerSpawner({
      amount: 1,
      playerImg: playerImg,
      laserImg: laserImg,
    })

    this.playerSpawner = playerSpawner
  }
  handleCollisions(frame) {
    //looping through the players array and updating each player and checking for collisions with the dinosaurs
    const playerKeys = Object.keys(this.playerSpawner.players)
    playerKeys.forEach((playerKey) => {
      const player = this.playerSpawner.players[playerKey]
      //get the laser keys for this player, lasers are created in an object with a key equal to the current frame
      const laserKeys = Object.keys(player.lasers)

      //get the keys of the dinosaurs
      const dinoKeys = Object.keys(this.dinosaurSpawner.dinosaurs)

      // loop through the laser keys and see if they are colliding with any dinosaurs and update their properties accordingly
      dinoKeys.forEach((dinoKey) => {
        const dino = this.dinosaurSpawner.dinosaurs[dinoKey]
        //get the difference in distance to the dino from the player
        const playerDistance = Math.hypot(
          player.position.x - dino.position.x,
          player.position.y - dino.position.y
        )

        //set the player distance on the dino
        dino.playerDistance = playerDistance

        if (dino.collision == true && playerDistance > 60) {
          dino.collision = false
        }
        //check to see if the ship is colliding with the dino
        if (playerDistance < 60 && dino.collision == false) {
          player.score -= 10
          const playerVelocity = player.velocity
          const dinoVelocity = dino.velocity
          //some basic physics for colliding with dinos
          player.velocity.x = -0.5 * playerVelocity.x + 0.5 * dinoVelocity.x
          player.velocity.y = -0.5 * playerVelocity.y + 0.5 * dinoVelocity.y

          dino.velocity.x = -0.5 * dinoVelocity.x - 0.5 * playerVelocity.x
          dino.velocity.y = -0.5 * dinoVelocity.y - 0.5 * playerVelocity.y

          //can uncomment this if we want to dino to be destroyed on collisions
          dino.collision = true
          dino.destroyedFrame = frame
        }

        //loop through the lasers to detect collisions
        laserKeys.length &&
          laserKeys.forEach((laserKey) => {
            if (player.lasers[laserKey]) {
              const distance = Math.hypot(
                player.lasers[laserKey].position.x - dino.position.x,
                player.lasers[laserKey].position.y - dino.position.y
              )
              if (distance < 45 && dino.destroyedFrame === null) {
                delete player.lasers[laserKey]
                player.score += 10
                dino.destroyedFrame = frame
              }
            }
          })
      })
      player.update(this.ctx, frame, this.dinosaurSpawner.dinosaurs)
    })
  }

  update(frame) {
    //We clear the last frame so that we can render the new frame
    this.ctx.clearRect(0, 0, innerWidth, innerHeight)
    this.handleCollisions(frame)

    this.playerSpawner.update(frame)
    this.dinosaurSpawner.update(this.ctx, frame)
  }
}
