
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as CurrentUserActions from '../../actions/current_user'
import MFAConfigurationPane from '../../components/MFAConfigurationPane'
import App from '../App'

class Configuration extends Component {

  handleEnableMFA () {
    this.props.userActions.changeMFAStatus(false)
  }

  handleDisableMFA () {
    this.props.userActions.changeMFAStatus(true)
  }

  handleUnenroll ({ enrollmentId }) {
    this.props.userActions.unenrollAsync({ enrollmentId })
  }

  handleEnrollment () {
    this.props.userActions.enrollDevice()
  }

  render () {
    return (<App>
      <MFAConfigurationPane
        enabled={!this.props.disableMFA}
        enrollments={this.props.enrollments || []}
        handleEnableMFA={::this.handleEnableMFA}
        handleDisableMFA={::this.handleDisableMFA}
        handleUnenroll={::this.handleUnenroll}
        handleEnrollment={::this.handleEnrollment}
      />
    </App>)
  }
}

function mapStateToProps (state) {
  return {
    disableMFA: state.current_user.user_metadata.disable_mfa,
    enrollments: state.current_user.guardian && state.current_user.guardian.enrollments || []
  }
}

function mapDispatchToProps (dispatch) {
  return {
    userActions: bindActionCreators(CurrentUserActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Configuration)
