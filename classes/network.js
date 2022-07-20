import { getBoundedRandom } from '../utils/game-utils'

function sigmoid(x) {
  return 1 / (1 + Math.pow(Math.E, -x))
}
function getCost(trainingOutput, sigmoidOutput) {
  return Math.pow(trainingOutput - sigmoidOutput, 2)
}

function getError(trainingOutput, realOutput, sigmoidOutput) {
  const dSig =
    Math.pow(Math.E, -realOutput) /
    Math.pow(1 + Math.pow(Math.E, -realOutput), 2)
  const dCost = -2 * (trainingOutput - sigmoidOutput)
  return dSig * dCost
}

function getDescentVelocity(beta, prevVelocity, dW, learningRate) {
  return beta * prevVelocity + learningRate * dW
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
    this.cost = null
    this.epic = []
    for (let i = 0; i < hiddenLayers + 1; i++) {
      if (i === 0) {
        this.layers.push(
          new Layer({
            inputCount: this.inputCount,
            outputCount: this.hiddenLayerInputCount,
          })
        )
      } else if (i === hiddenLayers) {
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

  static async learn(network) {
    for (let i = 0; i < network.layers.length; i++) {
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let bsum = 0
        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          let wsum = 0
          for (let l = 0; l < network.epic.length; l++) {
            let error = network.epic[l].layers[i].error[j]
            if (k === 0) {
              bsum += error
            }
            let input = network.epic[l].layers[i].inputs[k]
            let dW = error * input
            wsum += dW
          }
          network.layers[i].dW[k][j] = wsum * (1 / network.epic.length)
        }
        network.layers[i].dB[j] = bsum * (1 / network.epic.length)
      }
    }

    //adjust weights with gradient decent momentum
    const learningRate = 1 * Math.pow(10, -1)
    const biasLearningRate = 0.1
    const beta = 0.9

    for (let i = 0; i < network.layers.length; i++) {
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let dB = network.layers[i].dB[j]
        let newBias = network.layers[i].biases[j] - dB * biasLearningRate
        network.layers[i].biases[j] = newBias

        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          let weight = network.layers[i].weights[k][j]
          let dW = network.layers[i].dW[k][j]

          let newWeight = weight - dW * learningRate

          network.layers[i].weights[k][j] = newWeight
        }
      }
    }

    network.epic = []
    return network
  }

  static backpropError({ trainingData, network }) {
    let costSum = 0
    //go through each of the outputs to get the cost sum and the error vector
    for (let i = 0; i < trainingData.length; i++) {
      //get the cost for this output
      let cost = getCost(
        trainingData[i],
        network.layers[network.layers.length - 1].sigmoidOutputs[i]
      )
      costSum = costSum + cost

      //calculate the error for this output
      let error = getError(
        trainingData[i],
        network.layers[network.layers.length - 1].outputs[i],
        network.layers[network.layers.length - 1].sigmoidOutputs[i]
      )
      network.layers[network.layers.length - 1].error[i] = error
    }

    // propogate errors to previous layers
    for (let i = network.layers.length - 1; i > 0; i--) {
      let errors = new Array(network.layers[i].inputs)
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let error = network.layers[i].error[j]
        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          if (j === 0) {
            errors[k] = 0
          }
          let targetInput = network.layers[i].inputs[k]
          let weight = network.layers[i].weights[k][j]
          if (targetInput > 0) {
            errors[k] = errors[k] + weight * error
          } else {
            errors[k] = errors[k] + weight * error * 0.01
          }
        }
      }
      network.layers[i - 1].error = errors
    }

    network.cost =
      costSum * (1 / network.layers[network.layers.length - 1].outputs.length)

    const trainingExample = { layers: network.layers, cost: network.cost }
    network.epic.push(trainingExample)

    return network
  }

  static async feed(nextInputs, network) {
    network.layers[0].inputs = nextInputs
    for (let i = 0; i < network.layers.length; i++) {
      if (i > 0) {
        network.layers[i].inputs = network.layers[i - 1].outputs
      }
      if (i === network.layers.length - 1) {
        network.layers[i].sigmoidOutputs = new Array(
          network.layers[i].outputs.length
        )
      }
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let sum = 0
        let bias = network.layers[i].biases[j]
        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          let weight = network.layers[i].weights[k][j]
          let input = network.layers[i].inputs[k]
          let output = input * weight + bias
          sum += output
        }
        if (i === network.layers.length - 1) {
          network.layers[i].outputs[j] = sum
          network.layers[i].sigmoidOutputs[j] = sigmoid(sum)
        } else {
          //leaky ReLU
          if (sum > 0) {
            network.layers[i].outputs[j] = sum
          } else {
            network.layers[i].outputs[j] = sum * 0.01
          }
        }
      }
    }

    network.outputs = network.layers[
      network.layers.length - 1
    ].sigmoidOutputs.map((output, i) => {
      return output > 0.5 ? 1 : 0
    })

    return network
  }
}

export class Layer {
  constructor({ inputCount, outputCount }) {
    this.inputs = new Array(inputCount)
    this.outputs = new Array(outputCount)
    this.biases = new Array(outputCount)
    this.weights = new Array(inputCount)
    this.error = []
    this.dW = new Array(inputCount)
    this.dB = new Array(outputCount)
    this.velDw = new Array(inputCount)
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount)
      this.dW[i] = new Array(outputCount)
      this.velDw[i] = new Array(outputCount)
    }

    Layer.generateRandom(this)
  }

  static generateRandom(layer) {
    for (let i = 0; i < layer.inputs.length; i++) {
      for (let j = 0; j < layer.outputs.length; j++) {
        layer.velDw[i][j] = 0
        layer.dW[i][j] = 0
        layer.weights[i][j] = getBoundedRandom(-1, 1)
      }
    }
    for (let i = 0; i < layer.biases.length; i++) {
      layer.dB[i] = 0
      layer.biases[i] = getBoundedRandom(-1, 1)
    }
  }
}
