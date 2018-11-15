const inherits = require('util').inherits
const Component = require('react').Component
const h = require('react-hyperscript')
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const PropTypes = require('prop-types')
const connect = require('react-redux').connect
const actions = require('../../../../actions')
const { DEFAULT_ROUTE } = require('../../../../routes')
import Button from '../../../button'

DaoImportView.contextTypes = {
  t: PropTypes.func,
}

module.exports = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(DaoImportView)


function mapStateToProps (state) {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(state.metamask.accounts)[0],
  }
}


function mapDispatchToProps (dispatch) {
  return {
    importNewAccount: (strategy, [ privateKey ]) => {
      return dispatch(actions.importNewAccount(strategy, [ privateKey ]))
    },
    displayWarning: (message) => dispatch(actions.displayWarning(message || null)),
    setSelectedAddress: (address) => dispatch(actions.setSelectedAddress(address)),
  }
}

inherits(DaoImportView, Component)
function DaoImportView () {
  this.createKeyringOnEnter = this.createKeyringOnEnter.bind(this)
  Component.call(this)
}

DaoImportView.prototype.render = function () {
  const { error, displayWarning } = this.props

  return (
    h('div.new-account-import-form__private-key', [

      h('span.new-account-create-form__instruction', this.context.t('pasteEnsAddress')),

      h('div.new-account-import-form__ens-address-password-container', [

        h('input.new-account-import-form__input-password', {
          type: 'text',
          id: 'ens-box',
          onKeyPress: e => this.createKeyringOnEnter(e),
        }),

      ]),

      h('span.new-account-create-form__instruction', this.context.t('pasteParentAddress')),

      h('div.new-account-import-form__parent-address-password-container', [

        h('input.new-account-import-form__input-password', {
          type: 'text',
          id: 'parent-box',
          onKeyPress: e => this.createKeyringOnEnter(e),
        }),

      ]),
      h('span.new-account-create-form__instruction', this.context.t('pasteForwardingAddress')),

      h('div.new-account-import-form__forwarding-address-password-container', [

        h('input.new-account-import-form__input-password', {
          type: 'text',
          id: 'forwarding-box',
          onKeyPress: e => this.createKeyringOnEnter(e),
        }),

      ]),

      h('span.new-account-create-form__instruction', this.context.t('pasteDaoAddress')),

      h('div.new-account-import-form__dao-address-password-container', [

        h('input.new-account-import-form__input-password', {
          type: 'text',
          id: 'dao-box',
          onKeyPress: e => this.createKeyringOnEnter(e),
        }),

      ]),

      h('div.new-account-import-form__buttons', {}, [

        h(Button, {
          type: 'default',
          large: true,
          className: 'new-account-create-form__button',
          onClick: () => {
            displayWarning(null)
            this.props.history.push(DEFAULT_ROUTE)
          },
        }, [this.context.t('cancel')]),

        h(Button, {
          type: 'primary',
          large: true,
          className: 'new-account-create-form__button',
          onClick: () => this.createNewKeychain(),
        }, [this.context.t('import')]),

      ]),

      error ? h('span.error', error) : null,
    ])
  )
}

DaoImportView.prototype.createKeyringOnEnter = function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    this.createNewKeychain()
  }
}

DaoImportView.prototype.createNewKeychain = function () {
  const dao = document.getElementById('dao-box').value
  const ens = document.getElementById('ens-box').value
  const forwarding = document.getElementById('forwarding-box').value
  const parent = document.getElementById('parent-box').value
  const { importNewAccount, history, displayWarning, setSelectedAddress, firstAddress } = this.props

  importNewAccount('Dao', [ ens, dao, forwarding, parent])
    .then(({ selectedAddress }) => {
      if (selectedAddress) {
        history.push(DEFAULT_ROUTE)
        displayWarning(null)
      } else {
        displayWarning('Error importing account.')
        setSelectedAddress(firstAddress)
      }
    })
    .catch(err => err && displayWarning(err.message || err))
}
