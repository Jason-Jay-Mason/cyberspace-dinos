import styles from '../styles/Home.module.css'
import { Player } from '../classes/player'
import { DinosaurSpawner } from '../classes/dinosaurs'
import { useState } from 'react'

function generatePlayers(amount, playerImg, laserImg, dinoCount) {
  const player = new Player({
    imgEl: playerImg,
    laserImg: laserImg,
    width: 25,
    height: 22,
    position: {
      x: innerWidth / 2,
      y: innerHeight / 2,
    },
    rotation: 0,
    thrust: 0.09,
    playerType: 'ai',
    dinoCount: dinoCount,
  })
  return [player]
}
const handleLoadNetwork = async () => {
  const res = await fetch('/api/network/')
  const data = await res.json()
  console.log(data)
}

const handleSaveNetwork = async (network) => {
  const res = await fetch('/api/network/', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(network),
  })
  const json = await res.json()
  console.log(json)
}

export default function Home() {
  const [topPlayer, setTopPlayer] = useState(null)
  const handleCanvasRef = (canvas) => {
    if (canvas) {
      //set the canvas height and width
      canvas.height = innerHeight
      canvas.width = innerWidth
      //get the canvas context
      const ctx = canvas.getContext('2d')

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

      //set a dinoCounH
      let dinoCount = 1

      //generate an object with dinosaurs with a key equal to the created frame, the amount is the max amount of dinos that will be on screen
      const dinosaurSpawner = new DinosaurSpawner({
        amount: dinoCount,
        images: dinoImages,
      })

      //generate the players in the game with this helper function. The first argument is the amount of players desired and Returns an array of Player objects
      const players = generatePlayers(1, playerImg, laserImg, dinoCount)

      //declaring a number that increase by one every time the render function is called. This is so that we can have a messurment of time in the game
      const render = (time) => {
        let frame = time
        //This function will call a function each time an animation frame is ready in the browser. So essentially we a creating an infinite loop to simulate objects moving through time and space
        requestAnimationFrame(render)
        //We clear the last frame so that we can render the new frame
        ctx.clearRect(0, 0, innerWidth, innerHeight)

        //looping through the players array and updating each player and checking for collisions with the dinosaurs
        players.forEach((player) => {
          //get the laser keys for this player, lasers are created in an object with a key equal to the current frame
          const laserKeys = Object.keys(player.lasers)

          //get the keys of the dinosaurs
          const dinoKeys = Object.keys(dinosaurSpawner.dinosaurs)

          // loop through the laser keys and see if they are colliding with any dinosaurs and update their properties accordingly
          dinoKeys.forEach((dinoKey) => {
            //get the difference in distance to the dino from the player
            const playerDistance = Math.hypot(
              player.position.x - dinosaurSpawner.dinosaurs[dinoKey].position.x,
              player.position.y - dinosaurSpawner.dinosaurs[dinoKey].position.y
            )
            //push the distances into the radar
            dinosaurSpawner.dinosaurs[dinoKey].playerDistance = playerDistance
            //check to see if the ship is colliding with the dino
            if (
              playerDistance < 60 &&
              dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame === null
            ) {
              //some basic physics for colliding with dinos
              player.velocity.x -= dinosaurSpawner.dinosaurs[dinoKey].velocity.x
              player.velocity.y -= dinosaurSpawner.dinosaurs[dinoKey].velocity.y
              dinosaurSpawner.dinosaurs[dinoKey].velocity.x += player.velocity.x
              dinosaurSpawner.dinosaurs[dinoKey].velocity.y += player.velocity.y
              //can uncomment this if we want to dino to be destroyed on collisions
              // dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame = frame
            }

            //loop through the lasers to detect collisions
            laserKeys.length &&
              laserKeys.forEach((laserKey) => {
                if (player.lasers[laserKey]) {
                  const distance = Math.hypot(
                    player.lasers[laserKey].position.x -
                      dinosaurSpawner.dinosaurs[dinoKey].position.x,
                    player.lasers[laserKey].position.y -
                      dinosaurSpawner.dinosaurs[dinoKey].position.y
                  )
                  if (
                    distance < 45 &&
                    dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame === null
                  ) {
                    delete player.lasers[laserKey]
                    player.score += 1
                    dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame = frame
                  }
                }
              })

            //update the dinos
            dinosaurSpawner.dinosaurs[dinoKey].update(ctx, player, frame)

            //if a destroyed dino's animation is complete delete the expired dino
            if (
              dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame !== null &&
              dinosaurSpawner.dinosaurs[dinoKey].destroyedFrame + 350 < frame
            ) {
              delete dinosaurSpawner.dinosaurs[dinoKey]
            }
          })
          player.update(ctx, frame, dinosaurSpawner.dinosaurs)
        })

        //updating the dinosaurs
        dinosaurSpawner.update(ctx, frame, players[0])
      }

      //call the render function above
      render()
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={handleSaveNetwork}>save</button>
      <button onClick={handleLoadNetwork}>load</button>
      <canvas className={styles.canvas} ref={handleCanvasRef}></canvas>
    </div>
  )
}
