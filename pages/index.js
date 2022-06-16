import { useEffect, useState, createElement  } from 'react'
import styles from '../styles/Home.module.css'

class Controles {
	constructor(){
		this.right = false
		this.left = false
		this.thrust = false
		this.#addListeners()
	}
	#addListeners(){
		window.onkeydown = (e) =>{
			switch(e.key){
				case 'j':
					this.left = true
					break
				case 'l':
					this.right = true
					break
				case 'k':
					this.thrust = true
					break
			}
		}
		window.onkeyup = (e) =>{
			switch(e.key){
				case 'j':
					this.left = false
					break
				case 'l':
					this.right = false 
					break
				case 'k':
					this.thrust = false 
					break
			}
		}
	}

}

class Player{
	constructor({imgEl, width, height, position, rotation, thrust}){
		this.imgEl = imgEl 
		this.width = width
		this.height = height
		this.position = position
		this.rotation= rotation 
		this.thrust = thrust
		this.velocity = {
			x:0,
			y:0
		}
		this.controles = new Controles()
	}

	render(ctx){
		ctx.shadowColor = "rgba(255, 255, 255, 0.46)";
		ctx.shadowBlur = 17;
		ctx.translate(this.position.x,this.position.y)
		ctx.rotate(this.rotation)
		ctx.drawImage(this.imgEl, -this.width/2,  -this.height/2,  this.width , this.height)
		ctx.resetTransform()
	}

	update(ctx){
		if(this.controles.thrust){
			let speed = Math.abs(this.velocity.y + this.velocity.x)
			let factor = Math.pow(0.5, Math.abs(this.velocity.y + this.velocity.x)) 
			console.log(factor)
				this.velocity.x = this.velocity.x + factor * (Math.cos(this.rotation- Math.PI/2)*this.thrust)  
				this.velocity.y = this.velocity.y + factor * (Math.sin(this.rotation- Math.PI/2)*this.thrust) 
		}
		if(this.controles.right && !this.controles.left){
			this.rotation = this.rotation + (0.1) 
		}else if(this.controles.left && !this.controles.right){
			this.rotation = this.rotation - 0.1 
		}
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y


		this.render(ctx)
	}
}

export default function Home() {

	const handleCanvasRef = (canvas) => {
		if(canvas){
			canvas.height = innerHeight
			canvas.width = innerWidth
		}
		const ctx = canvas.getContext('2d')

		const playerImg = new Image()
		playerImg.src = '/j-ship.svg'
		playerImg.style.textShadow = '0px 0px 17px rgba(255, 255, 255, 0.46)'
		const player = new Player({
			imgEl: playerImg,
			width:27,
			height:26,
			position:{
				x:innerWidth/2,
				y:innerHeight/2,
			},
			rotation: 0,
			thrust: 0.02,
		})

		const render = () => {
			requestAnimationFrame(render)
			ctx.clearRect(0,0,innerWidth,innerHeight)
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
