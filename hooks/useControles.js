import {useEffect, useContext, useState, createContext} from 'react'

const ControlesContext = createContext()
const SetControlesContext = createContext()

export const useControles = () =>{
	const controles = useContext(ControlesContext);
	const setControles = useContext(SetControlesContext)

	return [controles, setControles]
}
export const ControlesProvider = ({children}) => {
	const [controles, setControles] = useState({
		thrust:false,
		rotateLeft: false,
		rotateRight: false,
	})

	const handleKey = (e) => {
		if(e.type === 'keydown'){
			switch(e.key){
				case 'j':
					setControles({...controles, rotateLeft:true})
					break
				case 'l':
					setControles({...controles, rotateRight:true})
					break
				case 'k':
					setControles({...controles, thrust:true})
					break
			}
		}
		if(e.type === 'keyup'){
			switch(e.key){
				case 'j':
					setControles({...controles, rotateLeft:false})
					break
				case 'l':
					setControles({...controles, rotateRight:false})
					break
				case 'k':
					setControles({...controles, thrust:false})
					break
			}
		}
	}

	useEffect(() => {
		window.addEventListener('keydown',handleKey )
		window.addEventListener('keyup',handleKey )
		return () => {
			window.removeEventListener('keyup', handleKey)
			window.removeEventListener('keydown', handleKey)
		}	
	}, [])
	return(
		<ControlesContext.Provider value={controles}>
			<SetControlesContext.Provider value={setControles}>
				{children}
			</SetControlesContext.Provider>
		</ControlesContext.Provider>	
	)
}
