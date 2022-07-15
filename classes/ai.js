import { Network } from './network'

export class Ai {
  constructor({ inputs }) {
    this.controles = []
    this.isTraining
    this.inputs = inputs
    this.network = new Network({
      training: false,
      inputCount: inputs.length,
      outputCount: 1,
      hiddenLayers: 1,
      hiddenLayerInputCount: 2,
    })
  }

  //load networks form the endpoint
  async loadNetwork() {
    try {
      const res = await fetch('/api/network/')
      const data = await res.json()
      const network = JSON.parse(data.network)
      return network
    } catch (err) {
      console.error(err)
    }
  }

  //function to save networks by hitting th api endpoint
  async saveNetwork(network) {
    try {
      const res = await fetch('/api/network/', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(network),
      })
      const json = await res.json()
      console.log(json)
    } catch (err) {
      console.error(err)
    }
  }

  update(inputs) {}
}
