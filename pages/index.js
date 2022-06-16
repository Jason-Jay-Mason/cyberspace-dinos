import styles from '../styles/Home.module.css'
import { Player } from '../classes/player'

export default function Home() {
  const handleCanvasRef = (canvas) => {
    if (canvas) {
      canvas.height = innerHeight
      canvas.width = innerWidth
    }
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

    const lasers = {}

    let frame = 0
    const render = () => {
      requestAnimationFrame(render)
      ctx.clearRect(0, 0, innerWidth, innerHeight)

      //handle updateing projectiles
      frame = frame + 1

      player.update(ctx, frame)
    }

    render()
  }

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={handleCanvasRef}></canvas>
    </div>
  )
}
