import { getBoundedRandom } from '../utils/game-utils'

function sigmoid(x) {
  return 1 / (1 + Math.pow(Math.E, -x))
}

export class Network {
  constructor({
    inputCount,
    outputCount,
    hiddenLayers,
    hiddenLayerInputCount,
  }) {
    this.inputCount = inputCount
    this.hiddenLayerInputCount = hiddenLayerInputCount
    this.hiddenLayers = hiddenLayers
    this.outputs = new Array(outputCount)
    this.layers = []
    for (let i = 0; i < hiddenLayers + 2; i++) {
      if (i === 0) {
        this.layers.push(
          new Layer({
            inputCount: this.inputCount,
            outputCount: this.hiddenLayerInputCount,
          })
        )
      } else if (i === hiddenLayers + 1) {
        this.layers.push(
          new Layer({
            inputCount: hiddenLayerInputCount,
            outputCount: outputCount,
          })
        )
      } else {
        this.layers.push(
          new Layer({
            inputCount: hiddenLayerInputCount,
            outputCount: hiddenLayerInputCount,
          })
        )
      }
    }
  }
  static feed(nextInputs, network) {
    let outputs = Layer.feed(nextInputs, network.layers[0])

    for (let i = 1; i < network.layers.length; i++) {
      outputs = Layer.feed(outputs, network.layers[i])
    }
    return outputs
  }
}

export class Layer {
  constructor({ inputCount, outputCount }) {
    this.inputs = new Array(inputCount)
    this.outputs = new Array(outputCount)
    this.biases = new Array(outputCount)
    this.weights = new Array(inputCount)
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount)
    }
    Layer.generateRandom(this)
  }

  static generateRandom(layer) {
    for (let i = 0; i < layer.inputs.length; i++) {
      for (let j = 0; j < layer.outputs.length; j++) {
        layer.weights[i][j] = getBoundedRandom(-1, 1)
      }
    }
    for (let i = 0; i < layer.biases.length; i++) {
      layer.biases[i] = getBoundedRandom(-1, 1)
    }
  }

  static feed(inputs = [0], layer) {
    let outputs = []
    for (let i = 0; i < layer.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < layer.inputs.length; j++) {
        sum = sum + layer.weights[j][i] * inputs[j] + layer.biases[i]
      }
      if (layer.outputs.length < 5) {
        if (sum > 0) {
          outputs.push(1)
        } else {
          outputs.push(0)
        }
      } else {
        if (sum > 0) {
          outputs.push(sum)
        } else {
          // Randomized negative outputs to negate dead neurons
          let slopeModifier = getBoundedRandom(0.1, 0.5)
          outputs.push(slopeModifier * sum)
        }
      }
    }
    return outputs
  }
}
