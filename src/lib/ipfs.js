/*
  This support library handles the connection to the IPFS network. It instantiates
  the IPFS node and starts the ipfs-coord library.
*/

// Global npm libraries
const IPFS = require('ipfs')
const IpfsCoord = require('ipfs-coord')
// const IpfsCoord = require('../../../ipfs-coord')
const BCHJS = require('@psf/bch-js')

// Local libraries
const JSONRPC = require('../rpc')

class IPFSLib {
  constructor (localConfig) {
    // Encapsulate dependencies
    this.IPFS = IPFS
    this.IpfsCoord = IpfsCoord
    this.bchjs = new BCHJS()
    this.rpc = new JSONRPC()

    // this.rpc = {}
    // if (localConfig.rpc) {
    //   this.rpc = localConfig.rpc
    // }
  }

  // This is a 'macro' start method. It kicks off several smaller methods that
  // start the various subcomponents of this IPFS library.
  async start () {
    await this.startIpfs()
    await this.startIpfsCoord()

    // Update the RPC instance with the instance of ipfs-coord.
    this.rpc.ipfsCoord = this.ipfsCoord

    console.log('IPFS is ready.')
  }

  async startIpfs () {
    try {
      // Ipfs Options
      const ipfsOptions = {
        repo: './ipfsdata',
        start: true,
        config: {
          relay: {
            enabled: true, // enable circuit relay dialer and listener
            hop: {
              enabled: true // enable circuit relay HOP (make this node a relay)
            }
          },
          pubsub: true, // enable pubsub
          Swarm: {
            ConnMgr: {
              HighWater: 30,
              LowWater: 10
            }
          }
        }
      }

      // Create a new IPFS node.
      this.ipfs = await this.IPFS.create(ipfsOptions)

      // Set the 'server' profile so the node does not scan private networks.
      await this.ipfs.config.profiles.apply('server')

      const nodeConfig = await this.ipfs.config.getAll()
      console.log(`IPFS node configuration: ${JSON.stringify(nodeConfig, null, 2)}`)
    } catch (err) {
      console.error('Error in startIpfs()')
      throw err
    }
  }

  async startIpfsCoord () {
    try {
      this.ipfsCoord = new this.IpfsCoord({
        ipfs: this.ipfs,
        type: 'node.js',
        bchjs: this.bchjs,
        privateLog: this.rpc.router
      })

      await this.ipfsCoord.isReady()
    } catch (err) {
      console.error('Error in startIpfsCoord()')
      throw err
    }
  }
}

module.exports = IPFSLib
