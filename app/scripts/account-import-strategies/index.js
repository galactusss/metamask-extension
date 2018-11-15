const Wallet = require('ethereumjs-wallet')
const importers = require('ethereumjs-wallet/thirdparty')
const ethUtil = require('ethereumjs-util')

const accountImporter = {

  async importAccount (strategy, args) {
    try {
      const importer = this.strategies[strategy]
      const privateKeyHex = await importer.apply(null, args)
      return Promise.resolve(privateKeyHex)
    } catch (e) {
      return Promise.reject(e)
    }
  },

  strategies: {
    'Private Key': async (privateKey, keyringController) => {
      if (!privateKey) {
        throw new Error('Cannot import an empty key.')
      }

      const prefixed = ethUtil.addHexPrefix(privateKey)
      const buffer = ethUtil.toBuffer(prefixed)

      if (!ethUtil.isValidPrivate(buffer)) {
        throw new Error('Cannot import invalid private key.')
      }

      const stripped = ethUtil.stripHexPrefix(prefixed)
      return await keyringController.addNewKeyring('Simple Key Pair', [ stripped ])
    },
    'JSON File': async (input, password, keyringController) => {
      let wallet
      try {
        wallet = importers.fromEtherWallet(input, password)
      } catch (e) {
        console.log('Attempt to import as EtherWallet format failed, trying V3...')
      }

      if (!wallet) {
        wallet = Wallet.fromV3(input, password, true)
      }

      return await keyringController.addNewKeyring('Simple Key Pair', [ walletToPrivateKey(wallet) ])
    },
    'Dao': async (ens, dao, forwarding, parent, keyringController) => {
      return await keyringController.addNewKeyring('Aragon Key', {
        'ens': ens,
        'dao': dao,
        'forwardingAddress': forwarding,
        'parentAddress': parent
      })
    },
  },

}

function walletToPrivateKey (wallet) {
  const privateKeyBuffer = wallet.getPrivateKey()
  return ethUtil.bufferToHex(privateKeyBuffer)
}

module.exports = accountImporter
