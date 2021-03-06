import React from 'react'
import { connect } from 'react-redux'

import SMMButton from '../buttons/SMMButton'
import WarningPanel from '../panels/WarningPanel'
import Connection from '../../Connection'
import { setConnection } from '../../actions/connection'

class ConnectArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      ip: '',
      port: '',
      warning: '',
      loading: false
    }
    this.onIPChange = this.onIPChange.bind(this)
    this.onPortChange = this.onPortChange.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onConnect = this.onConnect.bind(this)
  }
  componentWillMount () {
    if (!this.props.connectionError) return
    this.setState({
      warning: String(this.props.connectionError)
    })
  }
  componentWillReceiveProps (nextProps) {
    if (!nextProps.connectionError || nextProps.connectionError === this.props.connectionError) return
    this.setState({
      warning: String(nextProps.connectionError),
      loading: false
    })
  }
  onIPChange (e) {
    this.setState({
      ip: e.target.value.replace(/[^0-9a-z|^.]/g, '')
    })
  }
  onPortChange (e) {
    this.setState({
      port: e.target.value.replace(/[^0-9]/g, '')
    })
  }
  onKeyPress (e) {
    if (e.key === 'Enter') {
      this.onConnect()
    }
  }
  onConnect () {
    try {
      this.setState({
        loading: true
      })
      const connection = new Connection({
        server: {
          ip: this.state.ip,
          port: this.state.port || '3678',
          isDirect: true
        },
        emulator: this.props.emulator,
        username: this.props.username,
        characterId: this.props.characterId,
        onConnect: () => {
          this.props.dispatch(setConnection(connection))
        },
        onError: err => {
          err = String(err)
          if (err.includes('getaddrinfo')) {
            err = 'Could not resolve host name.\nDNS lookup failed'
          } else if (err.includes('DTIMEDOUT')) {
            err = 'Server timed out.\nIt might be offline or you inserted a wrong IP address'
          } else if (err.includes('ECONNREFUSED')) {
            err = 'Server refused connection.\nThe server might not have set up proper port forwarding or you inserted a wrong IP/port'
          }
          this.setState({
            warning: String(err),
            loading: false
          })
        }
      })
    } catch (err) {
      this.setState({
        loading: false
      })
      console.error(err)
    }
  }
  render () {
    const warning = this.state.warning
    const loading = this.state.loading
    const styles = {
      area: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        flex: '1 1 auto',
        padding: '40px',
        backgroundColor: '#24997e',
        fontSize: '18px',
        alignItems: 'center',
        color: '#000'
      },
      label: {
        width: '40%'
      },
      input: {
        width: '60%',
        fontSize: '16px'
      },
      loading: {
        display: 'flex',
        position: 'fixed',
        zIndex: '100',
        backgroundColor: 'rgba(0,0,0,0.6)',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
    return (
      <div style={styles.area}>
        {
          loading &&
          <div style={styles.loading}>
            <img src='img/load.gif' />
          </div>
        }
        {
          warning &&
          <WarningPanel warning={warning} />
        }
        <div style={styles.label}>IP address:</div>
        <input style={styles.input} value={this.state.ip} onChange={this.onIPChange} onKeyPress={this.onKeyPress} />
        <div style={styles.label}>Port:</div>
        <input style={styles.input} value={this.state.port} onChange={this.onPortChange} onKeyPress={this.onKeyPress} />
        <SMMButton text='Connect' iconSrc='img/net64.svg' onClick={this.onConnect} />
      </div>
    )
  }
}
export default connect(state => ({
  emulator: state.get('emulator'),
  username: state.getIn(['save', 'data', 'username']),
  characterId: state.getIn(['save', 'data', 'character'])
}))(ConnectArea)
