import {useEffect, useMemo, useState } from 'react'
	

export const usePlayer = (init, controles) => {
	//create the player state
	const [player, setPlayer] = useState(init)

	useEffect(()=>{
		const img = new Image()
		img.src = player.imgSrc
		setPlayer({...init, img})
	},[])

	const setRotation = useMemo(()=>{
		if(controles.rotateLeft){
			setPlayer({...player, rotation: -0.1})
		}
		if(controles.rotateRight){
			setPlayer({...player, rotation: 0.1})
		}
	},[controles])


	const update = (ctx) => {
		if(player.img){
			if(player.rotation !== 0){
				ctx.translate(player.width/2, player.height/2)
				ctx.rotate(player.rotation)
				ctx.translate(-player.width/2, -player.height/2)
				ctx.drawImage(player.img,player.position.x,player.position.y,player.width,player.height)
			}else{
				ctx.drawImage(player.img,player.position.x,player.position.y,player.width,player.height)
				ctx.resetTransform()
			}
		}
	}

	return {
		update,
		playerState:player,
		setPlayerState:setPlayer,
	}
}
