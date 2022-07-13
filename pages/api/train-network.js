async function backPropogation(network) {
  let avgCosts = []
  let avgOutputs = new Array(network.costFrames[0].network.layers.length)

  //average the costs
  for (let i = 0; i < network.costFrames[0].costs.length; i++) {
    let sum = 0
    for (let j = 0; j < network.costFrames.length; j++) {
      sum = sum + network.costFrames[j].costs[i]
    }
    avgCosts[i] = (1 / network.costFrames.length) * sum
  }
  //average the outputs
  for (let i = 0; i < network.costFrames.length; i++) {
    for (let j = 0; j < network.costFrames[i].network.layers.length; j++) {
      if (i === 0) {
        avgOutputs[j] = new Array(
          network.costFrames[i].network.layers[j].outputs.length
        )
      }
      for (
        let k = 0;
        k < network.costFrames[i].network.layers[j].outputs.length;
        k++
      ) {
        if (i === 0) {
          avgOutputs[j][k] = network.costFrames[i].network.layers[j].outputs[k]
        } else {
          avgOutputs[j][k] += network.costFrames[i].network.layers[j].outputs[k]
        }

        if (i === network.costFrames.length - 1) {
          avgOutputs[j][k] = (1 / network.costFrames.length) * avgOutputs[j][k]
        }
      }
    }
  }

  //get the gradient vector for each weight in the first layer
  // let weightGradients = []
  // let biasGradients = []
  // for (let i = network.layers.length - 1; i >= 0; i--) {
  //   weightGradients[i] = []
  //   biasGradients[i] = []
  //   if (i === network.layers.length - 1) {
  //     //outputs(4)
  //     for (let j = 0; j < network.layers[i].outputs.length; j++) {
  //       biasGradients[i][j] = []
  //
  //       let g = avgOutputs[i][j]
  //       let c = avgCosts[j]
  //       let b = network.layers[i].biases[j]
  //       //loop through outputs
  //       for (let k = 0; k < network.layers[i - 1].outputs.length; k++) {
  //         if (j === 0) {
  //           weightGradients[i][k] = []
  //         }
  //         let a = avgOutputs[i - 1][k]
  //         let w = network.layers[i].weights[k][j]
  //         let z = a * w + b
  //
  //         if (c < 0) {
  //           let gradient =
  //             (a *
  //               ((Math.log(1.01) * Math.pow(1.01, -z)) /
  //                 Math.pow(1 + Math.pow(1.01, -z), 2)) *
  //               1) /
  //             (1 - g)
  //           weightGradients[i][k][j] = gradient
  //         } else {
  //           let gradient =
  //             a *
  //             ((Math.log(1.01) * Math.pow(1.01, -z)) /
  //               Math.pow(1 + Math.pow(1.01, -z), 2)) *
  //             (1 / g)
  //           weightGradients[i][k][j] = gradient
  //         }
  //       }
  //     }
  //   }
  // }

  return avgCosts
}

export default async function handler(req, res) {
  const network = req.body
  const data = await backPropogation(network)
  if (req.method === 'POST') {
    res.status(200).json(data)
  }
}
