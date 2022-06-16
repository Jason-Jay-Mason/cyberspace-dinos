import { useEffect, useState, createElement } from 'react'
import styles from '../styles/Home.module.css'
import { Player } from '../classes/player'
import { Controles } from '../classes/controles'
import { Laser } from '../classes/laser'

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

    const controles = new Controles()

    const player = new Player({
      controles: controles,
      imgEl: playerImg,
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
      let laserKeys = Object.keys(lasers)
      let lastLaserFrame = parseInt(laserKeys[laserKeys.length - 1]) || -10
      if (controles.fire && lastLaserFrame + 10 < frame) {
        const rotation = player.rotation
        const position = {
          x: player.position.x - Math.cos(rotation - 0.2 + Math.PI / 2) * 18,
          y: player.position.y - Math.sin(rotation - 0.2 + Math.PI / 2) * 18,
        }
        const laser = new Laser({
          imgEl: laserImg,
          rotation: rotation,
          position: position,
        })
        lasers[frame] = laser
      }

      laserKeys &&
        laserKeys.forEach((laser) => {
          if (lasers[laser].position.y <= 0) {
            delete lasers[laser]
          }
          if (lasers[laser]) {
            lasers[laser].update(ctx)
          }
        })
      player.update(ctx)
    }

    render()
  }

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={handleCanvasRef}></canvas>
    </div>
  )
}
