import styles from '../styles/Home.module.css'
import { Player } from '../classes/player'
import { Dinosaurs } from '../classes/dinosaurs'

function generatePlayers(amount, playerImg, laserImg) {
  const player = new Player({
    imgEl: playerImg,
    laserImg: laserImg,
    width: 27,
    height: 26,
    position: {
      x: innerWidth / 2,
      y: innerHeight / 2,
    },
    rotation: 0,
    thrust: 0.02,
  })
  return [player]
}
export default function Home() {
  const handleCanvasRef = (canvas) => {
    if (canvas) {
      //set the canvas height and width
      canvas.height = innerHeight
      canvas.width = innerWidth
      //get the canvas context
      const ctx = canvas.getContext('2d')

      // create the image elements for all the object in the game
      const playerImg = new Image()
      playerImg.src = '/j-ship.svg'

      const laserImg = new Image()
      laserImg.src = '/laser.svg'

      const dummyDino = new Image()
      dummyDino.src = '/dino-dummy.png'
      const dinoImages = [dummyDino]

      //generate the players in the game with this helper function. The first argument is the amount of players desired and Returns an array of Player objects
      const players = generatePlayers(1, playerImg, laserImg)

      //generate an object with dinosaurs with a key equal to the created frame, the amount is the max amount of dinos that will be on screen
      const dinosaurs = new Dinosaurs({
        amount: 4,
        images: dinoImages,
      })

      //declaring a number that increase by one every time the render function is called. This is so that we can have a messurment of time in the game
      let frame = 0
      const render = () => {
        //This function will call a function each time an animation frame is ready in the browser. So essentially we a creating an infinite loop to simulate objects moving through time and space
        requestAnimationFrame(render)
        //We clear the last frame so that we can render the new frame
        ctx.clearRect(0, 0, innerWidth, innerHeight)

        //handle updateing the frame count
        frame = frame + 1

        //looping through the players array and updating each player and checking for collisions with the dinosaurs
        players.forEach((player) => {
          //get the laser keys for this player, lasers are created in an object with a key equal to the current frame
          const laserKeys = Object.keys(player.lasers)

          //get the keys of the dinosaurs
          const dinoKeys = Object.keys(dinosaurs.dinosaurs)

          // loop through the laser keys and see if they are colliding with any dinosaurs and update their properties accordingly
          dinoKeys.forEach((dinoKey) => {
            //if a destroyed dino's animation is complete delete the expired dino
            if (
              dinosaurs.dinosaurs[dinoKey].destroyedFrame !== null &&
              dinosaurs.dinosaurs[dinoKey].destroyedFrame + 10 < frame
            ) {
              delete dinosaurs.dinosaurs[dinoKey]
            }
            //loop through the lasers to detect collisions
            laserKeys.length &&
              laserKeys.forEach((laserKey) => {
                if (dinosaurs.dinosaurs[dinoKey] && player.lasers[laserKey]) {
                  const distance = Math.hypot(
                    player.lasers[laserKey].position.x -
                      dinosaurs.dinosaurs[dinoKey].position.x,
                    player.lasers[laserKey].position.y -
                      dinosaurs.dinosaurs[dinoKey].position.y
                  )
                  if (
                    distance < 40 &&
                    dinosaurs.dinosaurs[dinoKey].destroyedFrame === null
                  ) {
                    delete player.lasers[laserKey]
                    dinosaurs.dinosaurs[dinoKey].destroyedFrame = frame
                    return
                  }
                }
              })
            if (dinosaurs.dinosaurs[dinoKey]) {
              dinosaurs.dinosaurs[dinoKey].update(ctx, player)
            }
          })
          player.update(ctx, frame)
        })

        //updating the dinosaurs
        dinosaurs.update(ctx, frame, players[0])
      }

      //call the render function above
      render()
    }
  }

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={handleCanvasRef}></canvas>
    </div>
  )
}
