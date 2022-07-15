import { getBoundedRandom } from '../utils/game-utils'

function getCost(trainingOutput, realOutput) {
  //Get the absolute value of the difference between the ideal output and the realoutput, the operation is communitive
  return Math.abs(realOutput - trainingOutput)
}

function getError(trainingOutput, realOutput) {
  //use the derivative of the cost function with respect to the real output to get the error value
  return (realOutput - trainingOutput) / Math.abs(realOutput - trainingOutput)
}
function getDescentVelocity(beta, prevVelocity, dW) {
  return beta * prevVelocity + dW
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

  static async learn({ network }) {
    //compute gradient vectors; ie the derivatives of the cost with respect to w[k][j] and b[j] using dC/da (the error vector)
    for (let i = 0; i < network.layers.length; i++) {
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let dbSum = 0
        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          let dwSum = 0
          for (let l = 0; l < network.epic.length; l++) {
            let error = network.epic[l].layers[i].error[j]
            if (k === 0) {
              dbSum += error
            }
            let input = network.epic[l].layers[i].inputs[k]
            let dW = input * error
            dwSum += dW
          }
          network.layers[i].dW[k][j] = dwSum
        }
        network.layers[i].dB[j] = dbSum
      }
    }

    //adjust weights with gradient decent momentum
    const learningRate = 1 * Math.pow(10, -8)
    const biasLearningRate = 0.01
    const beta = 0.9

    for (let i = 0; i < network.layers.length; i++) {
      for (let j = 0; j < network.layers[i].outputs.length; j++) {
        let dB = network.layers[i].dB[j]
        let newBias = network.layers[i].biases[j] - dB * biasLearningRate
        network.layers[i].biases[j] = newBias

        for (let k = 0; k < network.layers[i].inputs.length; k++) {
          let weight = network.layers[i].weights[k][j]
          let dW = network.layers[i].dW[k][j]
          let prevVelocity = network.layers[i].velDw[k][j]
          let vel = getDescentVelocity(beta, prevVelocity, dW)
          let adjustment = learningRate * vel
          let newWeight = weight - learningRate * dW
          network.layers[i].velDw[k][j] = vel
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
        network.layers[network.layers.length - 1].outputs[i]
      )
      costSum = costSum + cost

      //calculate the error for this outputs
      let error = getError(
        trainingData[i],
        network.layers[network.layers.length - 1].outputs[i]
      )
      network.layers[network.layers.length - 1].error[i] = error
    }

    // propogate errors to previous layers
    for (let i = network.layers.length - 1; i > 0; i--) {
      let errors = new Array(network.layers[i].inputs)
      //loop through each of the weight arrays that correspond to each input
      for (let j = 0; j < network.layers[i].weights.length; j++) {
        //loop through the errors array for each of the inputs and get the error for the input[i][j]
        let sum = 0
        //pattern: jth weight array [k+ k2 + k3 + ... kn] -> jth error [j1, j2,...jn]
        for (let k = 0; k < network.layers[i].error.length; k++) {
          let error = network.layers[i].error[k]
          let weight = network.layers[i].weights[j][k]
          sum += weight * error
        }
        errors[j] = sum
      }
      network.layers[i - 1].error = errors
    }

    network.cost = costSum
    const trainingExample = { layers: network.layers, cost: network.cost }
    network.epic.push(trainingExample)

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

  static feed(inputs = [0], layer, training) {
    let outputs = []
    for (let i = 0; i < layer.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < layer.inputs.length; j++) {
        let a = layer.weights[j][i] * inputs[j] + layer.biases[i]
        sum = sum + a
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
