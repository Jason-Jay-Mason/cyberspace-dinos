import { Network } from './network'

export class Ai {
  constructor({ inputs }) {
    this.output = []
    this.inputs = inputs
    this.initialized = false
    this.trainingData = []
    this.network = {}
    this.loading = false
  }
  initialize() {
    this.network = new Network({
      inputCount: this.inputs.length,
      outputCount: 3,
      hiddenLayers: 1,
      hiddenLayerInputCount: 4,
      training: true,
    })

    const saveBtn = document.getElementById('save-network')
    const loadBtn = document.getElementById('load-network')
    const trainBtn = document.getElementById('train-network')

    trainBtn.addEventListener('click', () => {
      this.network.training = !this.network.training
      console.log(`network training: ${this.training}`)
    })

    saveBtn.addEventListener('click', () => {
      this.saveNetwork()
    })
    loadBtn.addEventListener('click', () => {
      this.loadNetwork()
    })

    this.initialized = true
  }

  //load networks form the endpoint
  async loadNetwork() {
    try {
      const res = await fetch('/api/network/')
      const data = await res.json()
      const network = JSON.parse(data.network)
      network.trainingInProgress = false
      network.training = false
      this.network = network
      console.log(this.network)
    } catch (err) {
      console.error(err)
    }
  }

  //function to save networks by hitting th api endpoint
  async saveNetwork() {
    const network = { ...this.network, epic: [] }
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
  async feedNetwork(inputs, trainingData) {
    this.loading = true
    this.inputs = inputs
    if (this.network.training === true) {
      const fedNet = await Network.feed(inputs, this.network)
      const errNetwork = await Network.backpropError({
        trainingData: trainingData,
        network: fedNet,
      })
      if (errNetwork.epic.length > 1) {
        const newNetwork = await Network.learn(errNetwork)
        this.network = newNetwork
        console.log(newNetwork.cost)
      } else {
        this.network = errNetwork
      }
    } else {
      const nextNetwork = await Network.feed(inputs, this.network)
      this.network = nextNetwork
      this.output = nextNetwork.outputs
      console.log(
        this.network.layers[this.network.layers.length - 1].sigmoidOutputs
      )
    }
    this.loading = false
  }

  update(inputs, trainingData) {
    if (this.initialized === false) {
      this.inputs = inputs
      this.initialize(inputs)
    }
    if (!this.loading) {
      this.feedNetwork(inputs, trainingData)
    }
  }
}
