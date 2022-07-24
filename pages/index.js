import styles from '../styles/Home.module.css'
import { DinoGame } from '../classes/dino-game'

export default function Home() {
  const handleCanvasRef = (canvas) => {
    if (canvas) {
      //set the canvas height and width
      canvas.height = innerHeight
      canvas.width = innerWidth
      //get the canvas context
      const ctx = canvas.getContext('2d')
      const dinoGame = new DinoGame({
        dinosaurCount: 7,
        context: ctx,
      })

      // declaring a number that increase by one every time the render function is called. This is so that we can have a messurment of time in the game
      const render = (time) => {
        requestAnimationFrame(render)
        dinoGame.update(time)
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
