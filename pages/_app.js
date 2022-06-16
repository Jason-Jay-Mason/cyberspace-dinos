import '../styles/globals.css'
import {ControlesProvider} from '../hooks/useControles'

function MyApp({ Component, pageProps }) {
  return (
		<ControlesProvider>
			<Component {...pageProps} />
		</ControlesProvider>
		)}

export default MyApp
