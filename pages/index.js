import styles from '../styles/Home.module.css'
import { Player } from '../classes/player'
import { Dinosaur } from '../classes/dinosaur'

function getBoundedRandom(min, max) {
  return Math.random() * (max - min) + min
}

class Dinosaurs {
  constructor({ amount, images }) {
    this.amount = amount
    this.images = images
    this.dinosaurs = {}
  }
  buildDinosaurs(frame) {
    const dinosaursKeys = Object.keys(this.dinosaurs) || []
    if (dinosaursKeys.length < this.amount) {
      const dinosaur = new Dinosaur({
        imgEl: this.images[0],
        rotation: 0.2,
        position: {
          x: getBoundedRandom(40, innerWidth - 40),
          y: getBoundedRandom(40, innerHeight - 40),
        },
        velocity: {
          x: getBoundedRandom(-0.5, 0.5),
          y: getBoundedRandom(-0.5, 0.5),
        },
        rotationVelocity: getBoundedRandom(-0.007, 0.007),
        width: 130,
        height: 139,
      })
      this.dinosaurs[frame] = dinosaur
    }
  }
  renderDinos(ctx, player) {
    const dinosaursKeys = Object.keys(this.dinosaurs) || []
    const laserKeys = Object.keys(player.lasers)

    dinosaursKeys.forEach((dinoKey) => {
      laserKeys.length &&
        laserKeys.forEach((laserKey) => {
          if (this.dinosaurs[dinoKey] && player.lasers[laserKey]) {
            const distance = Math.hypot(
              player.lasers[laserKey].position.x -
                this.dinosaurs[dinoKey].position.x,
              player.lasers[laserKey].position.y -
                this.dinosaurs[dinoKey].position.y
            )
            if (distance < 40) {
              delete player.lasers[laserKey]
              delete this.dinosaurs[dinoKey]
              return
            }
          }
        })
      if (this.dinosaurs[dinoKey]) {
        this.dinosaurs[dinoKey].update(ctx, player)
      }
    })
  }
  update(ctx, frame, player) {
    this.buildDinosaurs(frame)
    this.renderDinos(ctx, player)
  }
}

export default function Home() {
  const handleCanvasRef = (canvas) => {
    if (canvas) {
      canvas.height = innerHeight
      canvas.width = innerWidth
      const ctx = canvas.getContext('2d')

      const playerImg = new Image()
      playerImg.src = '/j-ship.svg'

      const laserImg = new Image()
      laserImg.src = '/laser.svg'

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

      const dummyDino = new Image()
      dummyDino.src = '/dino-dummy.png'
      const dinoImages = [dummyDino]

      const dinosaurs = new Dinosaurs({
        amount: 4,
        images: dinoImages,
      })

      let frame = 0
      const render = () => {
        requestAnimationFrame(render)
        ctx.clearRect(0, 0, innerWidth, innerHeight)

        //handle updateing projectiles
        frame = frame + 1

        player.update(ctx, frame)
        dinosaurs.update(ctx, frame, player)
      }

      render()
    }
  }

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={handleCanvasRef}></canvas>
    </div>
  )
}
