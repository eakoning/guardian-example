
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as TransactionActions from '../../actions/transaction'
import * as CurrentUserActions from '../../actions/current_user'
import { Link } from 'react-router'
import Loading from '../../components/Loading'

class App extends Component {
  componentDidMount () {
    if (typeof this.props.preload === 'undefined' || this.props.preload) {
      this.props.userActions.readCurrentUser()
    }
  }

  handleLogout (e) {
    e.preventDefault()
    this.props.transactionActions.tryAgain()
  }

  render () {
    return (<div>
      <nav className='navbar navbar-default navbar-fixed-bottom'>
        <div className='container'>
          <div className='navbar-brand'>
            Guardian Tester
          </div>
          <div className='navbar-left navbar-form'>
            <a className='btn btn-danger' onClick={::this.handleLogout}>Try Again</a>
          </div>
          <ul className='nav navbar-nav navbar-right'>
            <li><Link to=''><i className='glyphicon glyphicon-home'></i> Home</Link></li>
            <li><Link to='/step-up'><i className='glyphicon glyphicon-cog'></i> MFA Configuration</Link></li>
          </ul>
        </div>
      </nav>
      {this.props.loading && <Loading />}
      <div style={{ marginTop: '30px' }}>
        {this.props.user.loading ? (<h3 className='text-info'>Loading...</h3>) : this.props.children}
      </div>
    </div>)
  }
}

function mapStateToProps (state) {
  return {
    loading: state.transaction.loading,
    idToken: state.transaction.idToken,
    mfa: { disable_mfa: state.current_user.user_metadata.disable_mfa },
    user: state.current_user
  }
}

function mapDispatchToProps (dispatch) {
  return {
    transactionActions: bindActionCreators(TransactionActions, dispatch),
    userActions: bindActionCreators(CurrentUserActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
