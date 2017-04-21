/* eslint-disable react/no-unused-prop-types */
const React = require('react')
const { findDOMNode } = require('react-dom')
const { camelToDashString, STRING_TO_TIMING_FUNCTION } = require('./transitionHelpers')


module.exports = class TransitionerGroupChild extends React.Component {

  static React.PropTypes = {
    children: React.PropTypes.node,

    duration: React.PropTypes.number.isRequired,
    timingFunction: React.PropTypes.string.isRequired,

    transitionAppear: React.PropTypes.shape({
      from: React.PropTypes.object.isRequired,
      to: React.PropTypes.object.isRequired,
      duration: React.PropTypes.number,
      timingFunction: React.PropTypes.string,
      delay: React.PropTypes.number
    }),

    transitionEnter: React.PropTypes.shape({
      from: React.PropTypes.object.isRequired,
      to: React.PropTypes.object.isRequired,
      duration: React.PropTypes.number,
      timingFunction: React.PropTypes.string,
      delay: React.PropTypes.number
    }),

    transitionLeave: React.PropTypes.shape({
      from: React.PropTypes.object.isRequired,
      to: React.PropTypes.object.isRequired,
      duration: React.PropTypes.number,
      timingFunction: React.PropTypes.string,
      delay: React.PropTypes.number
    })
  }

  constructor(props) {
    super(props)
    this.transitionTimeouts = []
    this.origionalStyle = {}
    this.origionalStylesChanged = []
  }

  componentWillMount() {
    this.origionalStyle = {
      ...findDOMNode(this)
    }
  }

  componentWillUnmount() {
    this.unmounted = true
    this.transitionTimeouts.forEach(clearTimeout)
  }

  getStylePropertyString = style =>
    Object.keys(style).map(camelToDashString).join(', ')

  getTransitionDuration = transition => (
    (transition && transition.duration) ?
      transition.duration :
      this.props.duration
  )

  getTransitionDelay = transition => (
    (transition && transition.delay) ?
      transition.delay :
      0
  )

  getTransitionTimingFunction = transition => {
    const timingFunction = (transition && transition.timingFunction) ?
      transition.timingFunction :
      this.props.timingFunction
    return STRING_TO_TIMING_FUNCTION[timingFunction] || timingFunction
  }

  setupTransition = transition =>
    new Promise(resolve => {
      const delay = this.getTransitionDelay(transition)
      const duration = this.getTransitionDuration(transition)
      const properties = this.getStylePropertyString(transition.from)
      const timingFunction = this.getTransitionTimingFunction(transition)

      this.addStyle({
        ...transition.from,
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transitionProperty: `${properties}`,
        transitionTimingFunction: `${timingFunction}`
      })

      window.requestAnimationFrame(() => {
        const node = findDOMNode(this)
        /* eslint-disable no-unused-expressions */
        node.scrollTop // Forces repaint
        /* eslint-enable no-unused-expressions */
        resolve()
      })
    })

  executeTransition = async (transition, callback) => {
    await this.setupTransition(transition)
    this.addStyle(transition.to)
    const duration = this.getTransitionDuration(transition)
    const timeout = setTimeout(callback, duration)
    this.transitionTimeouts.push(timeout)
  }

  addStyle = newStyle => {
    const node = findDOMNode(this)
    Object.keys(newStyle).forEach(property => {
      const newValue = newStyle[property]
      node.style[property] = newValue
      if (node.style[property] === newValue)
        this.origionalStylesChanged.push(property)
    })
  }

  revertStyles = () => {
    const node = findDOMNode(this)
    this.origionalStylesChanged.forEach(property => {
      node.style[property] = this.origionalStyle[property] || ''
    })
  }

  componentWillAppear = async callback => {
    const { transitionAppear } = this.props
    if (transitionAppear)
      this.executeTransition(transitionAppear, callback)
    else
      callback()
  }

  componentWillEnter = async callback => {
    const { transitionEnter } = this.props
    if (transitionEnter)
      this.executeTransition(transitionEnter, callback, false)
    else
      callback()
  }

  componentWillLeave = async callback => {
    const { transitionLeave } = this.props
    if (transitionLeave)
      this.executeTransition(transitionLeave, callback)
    else
      callback()
  }

  render() {
    const props = { ...this.props }
    delete props.timingFunction
    delete props.duration
    delete props.transitionAppear
    delete props.transitionEnter
    delete props.transitionLeave
    delete props.children
    return React.cloneElement(React.Children.only(this.props.children), props)
  }
}
