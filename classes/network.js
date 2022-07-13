import { getBoundedRandom } from '../utils/game-utils'

function sigmoid(x) {
  return 1 / (1 + Math.pow(1.01, -x))
}

function cost(trainingData, realOutput) {
  return realOutput - trainingData
}
function cost2(trainingOuput, realOutput) {
  if (trainingOuput === 0) {
    //if the training output is 0 we want our realOutput to be roughly = to 0 so we let the output cost be negative
    return Math.log(1 - realOutput)
  }
  if (trainingOuput === 1) {
    //if the trainingOuput is 1 we want our output to be possitive
    return -Math.log(realOutput)
  }
}

export class Network {
  constructor({
    inputCount,
    outputCount,
    hiddenLayers,
    hiddenLayerInputCount,
    training,
  }) {
    this.training = training
    this.trainingInProgress = false
    this.inputCount = inputCount
    this.hiddenLayerInputCount = hiddenLayerInputCount
    this.hiddenLayers = hiddenLayers
    this.outputs = new Array(outputCount)
    this.layers = []
    this.costFrames = []
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

  static getCosts({ trainingData, network }) {
    let costs = []
    for (let i = 0; i < trainingData.length; i++) {
      costs[i] = cost(
        trainingData[i],
        network.layers[network.layers.length - 1].outputs[i]
      )
    }
    let singularOutputs = []
    for (let i = 0; i < network.layers.length; i++) {
      singularOutputs[i] = network.layers[i].singularOutputs
    }
    network.costFrames.push({
      costs: costs,
      network: { ...network, costFrames: null },
    })

    return network
  }

  static feed(nextInputs, network) {
    let outputs = Layer.feed(nextInputs, network.layers[0])
    network.layers[0].outputs = outputs
    network.layers[0].inputs = nextInputs

    for (let i = 1; i < network.layers.length; i++) {
      network.layers[i].inputs = network.layers[i - 1].outputs
      network.layers[i].outputs = Layer.feed(
        network.layers[i - 1].outputs,
        network.layers[i],
        network.training
      )
    }
    network.outputs = network.layers[network.layers.length - 1].outputs
    return network
  }
}

export class Layer {
  constructor({ inputCount, outputCount }) {
    this.inputs = new Array(inputCount)
    this.outputs = new Array(outputCount)
    this.biases = new Array(outputCount)
    this.weights = new Array(inputCount)
    this.singularOutputs = new Array(inputCount)
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount)
      this.singularOutputs[i] = new Array(outputCount)
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
      layer.biases[i] = getBoundedRandom(-20, 20)
    }
  }

  static feed(inputs = [0], layer, training) {
    let outputs = []
    for (let i = 0; i < layer.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < layer.inputs.length; j++) {
        layer.singularOutputs[j][i] =
          layer.weights[j][i] * inputs[j] + layer.biases[i]
        sum = sum + layer.singularOutputs[j][i]
      }
      if (layer.outputs.length < 5) {
        if (training === true) {
          outputs.push(sum)
        } else {
          if (sum > 0) {
            outputs.push(1)
          } else {
            outputs.push(0)
          }
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
