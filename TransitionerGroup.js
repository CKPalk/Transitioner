/* eslint-disable no-restricted-syntax, guard-for-in, no-prototype-builtins, no-underscore-dangle */
const React = require('react')
const chain = require('chain-function')

const transitionHelpers = require('./transitionHelpers')
const getChildMapping = transitionHelpers.getChildMapping
const mergeChildMappings = transitionHelpers.mergeChildMappings


module.exports = class TransitionerGroup extends React.Component {

  static propTypes = {
    component: React.PropTypes.any,
    childFactory: React.PropTypes.func,
    children: React.PropTypes.node
  }

  static defaultProps = {
    component: 'span',
    childFactory: child => child
  }

  constructor(props, context) {
    super(props, context)

    this.childRefs = Object.create(null)

    this.state = {
      children: getChildMapping(props.children)
    }
  }

  componentWillMount() {
    this.currentlyTransitioningKeys = {}
    this.keysToEnter = []
    this.keysToLeave = []
  }

  componentDidMount() {
    const initialChildMapping = this.state.children;
    for (const key in initialChildMapping)
      if (initialChildMapping[key])
        this.performAppear(key)
  }

  componentWillReceiveProps(nextProps) {
    const nextChildMapping = getChildMapping(nextProps.children)
    const prevChildMapping = this.state.children

    this.setState({
      children: mergeChildMappings(
        prevChildMapping,
        nextChildMapping,
      )
    })

    for (const key in nextChildMapping) {
      const hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key)
      if (nextChildMapping[key] && !hasPrev &&
          !this.currentlyTransitioningKeys[key])
        this.keysToEnter.push(key)
    }

    for (const key in prevChildMapping) {
      const hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key)
      if (prevChildMapping[key] && !hasNext &&
          !this.currentlyTransitioningKeys[key])
        this.keysToLeave.push(key)
    }
  }

  componentDidUpdate() {
    const keysToEnter = this.keysToEnter
    this.keysToEnter = []
    keysToEnter.forEach(this.performEnter)

    const keysToLeave = this.keysToLeave
    this.keysToLeave = []
    keysToLeave.forEach(this.performLeave)
  }

  performAppear = key => {
    this.currentlyTransitioningKeys[key] = true

    const component = this.childRefs[key]
    if (component.componentWillAppear)
      component.componentWillAppear(
        this._handleDoneAppearing.bind(this, key)
      )
    else
      this._handleDoneAppearing(key)
  }

  _handleDoneAppearing = key => {
    const component = this.childRefs[key]
    if (component && component.componentDidAppear)
      component.componentDidAppear()

    delete this.currentlyTransitioningKeys[key]

    const currentChildMapping = getChildMapping(this.props.children)

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key))
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key)
  }

  performEnter = key => {
    this.currentlyTransitioningKeys[key] = true

    const component = this.childRefs[key]
    if (component.componentWillEnter)
      component.componentWillEnter(
        this._handleDoneEntering.bind(this, key)
      )
    else
      this._handleDoneEntering(key)
  }

  _handleDoneEntering = key => {
    const component = this.childRefs[key]
    if (component && component.componentDidEnter)
      component.componentDidEnter()


    delete this.currentlyTransitioningKeys[key]

    const currentChildMapping = getChildMapping(this.props.children)

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key))
      // This was removed before it had fully entered. Remove it.
      this.performLeave(key)
  }

  performLeave = key => {
    this.currentlyTransitioningKeys[key] = true

    const component = this.childRefs[key]
    if (component.componentWillLeave)
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key))
    else
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key)
  }

  _handleDoneLeaving = key => {
    const component = this.childRefs[key]

    if (component && component.componentDidLeave)
      component.componentDidLeave()

    delete this.currentlyTransitioningKeys[key]

    const currentChildMapping = getChildMapping(this.props.children)

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key))
      // This entered again before it fully left. Add it again.
      this.performEnter(key)
    else
      this.setState(state => {
        const newChildren = { ...state.children }
        delete newChildren[key]
        return { children: newChildren }
      })
  };

  render() {
    const childrenToRender = []
    for (const key in this.state.children)
      if (this.state.children[key]) {
        const child = this.state.children[key]
        const isCallbackRef = typeof child.ref !== 'string'

        childrenToRender.push(React.cloneElement(
          this.props.childFactory(child),
          {
            key,
            ref: chain(
              isCallbackRef ? child.ref : null,
              r => {
                this.childRefs[key] = r
              }
            )
          }
        ));
      }

    // Do not forward TransitionGroup props to primitive DOM nodes
    const props = Object.assign({}, this.props)
    delete props.duration
    delete props.timingFunction
    delete props.transitionLeave
    delete props.transitionAppear
    delete props.transitionEnter
    delete props.childFactory
    delete props.component

    return React.createElement(
      this.props.component,
      props,
      childrenToRender
    )
  }
}
