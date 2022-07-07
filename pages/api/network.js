import { writeFileSync, readFileSync } from 'fs'

function loadNetwork() {
  const data = readFileSync('./networks/network.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    return data
  })
  return data
}

function saveNetwork(network) {
  const data = JSON.stringify(network)
  const path = './networks/network.json'
  const options = {
    encoding: 'utf8',
  }
  writeFileSync(path, data, options)
}
export default function handler(req, res) {
  const data = req.body
  if (req.method === 'POST') {
    try {
      saveNetwork(data)
      res.status(200).json({ status: 'save success' })
    } catch (err) {
      res.status(500).send({ error: `Failded to post data: ${err}` })
    }
  }
  if (req.method === 'GET') {
    try {
      const network = loadNetwork(data)
      console.log(network)
      res.status(200).json({ network })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: `Failded to post data: ${err}` })
    }
  }
}
