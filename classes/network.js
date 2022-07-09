import { getBoundedRandom } from '../utils/game-utils'

function sigmoid(x) {
  return 1 / (1 + Math.pow(Math.E, -x))
}

function cost(trainingOuput, realOutput) {
  return (
    trainingOuput * Math.log(realOutput) +
    (1 - trainingOuput) * Math.log(1 - realOutput)
  )
}
function cost2(trainingOuput, realOutput) {
  return Math.pow(realOutput - trainingOuput, 2)
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

  static trainNetwork({ trainingData, networkOutputs, network }) {
    //for each of the network outputs and trainingData, run the cost function
    let costs = []
    for (let i = 0; i < trainingData.length; i++) {
      costs.push(cost2(trainingData[i], networkOutputs[i]))
    }

    // put the costs the costs frames array on the network
    network.costFrames.push(costs)

    //wait until there are 200 frames of cost data to adjust the weights and baises
    if (network.costFrames.length > 500) {
      //average the cost data
      let avgCosts = new Array(trainingData.length)
      for (let i = 0; i < trainingData.length; i++) {
        let sum = 0
        for (let j = 0; j < network.costFrames.length; j++) {
          sum = sum + network.costFrames[j][i]
        }
        //finally average the sum and push into avgCost array
        // this is a cross entropy algorythm by the way..
        avgCosts[i] = -(1 / network.costFrames.length) * sum
      }
      //now calculate the derivitives of the cost with respect to weights and baises and adjust accordingly using the gradient vector as a ratio

      console.log(avgCosts)

      //clear the costFrames array on the network
      network.costFrames = []
    }

    return network
  }

  static feed(nextInputs, network) {
    let outputs = Layer.feed(nextInputs, network.layers[0])

    for (let i = 1; i < network.layers.length; i++) {
      outputs = Layer.feed(outputs, network.layers[i], network.training)
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

  static feed(inputs = [0], layer, training) {
    let outputs = []
    for (let i = 0; i < layer.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < layer.inputs.length; j++) {
        sum = sum + layer.weights[j][i] * inputs[j] + layer.biases[i]
      }
      if (layer.outputs.length < 5) {
        if (training == true) {
          outputs.push(sigmoid(sum))
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
