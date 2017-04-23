/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'

import { timingFunctions } from './transitionHelpers'
import TransitionerGroup from './TransitionerGroup'
import TransitionerGroupChild from './TransitionerGroupChild'

module.exports = class Transitioner extends React.Component {

  static timingFunctions = timingFunctions

  static propTypes = {
    duration: PropTypes.number,
    timingFunction: PropTypes.string,

    transitionAppear: PropTypes.shape({
      from: PropTypes.object.isRequired,
      to: PropTypes.object.isRequired,
      duration: PropTypes.number,
      timingFunction: PropTypes.string,
      delay: PropTypes.number
    }),

    transitionEnter: PropTypes.shape({
      from: PropTypes.object.isRequired,
      to: PropTypes.object.isRequired,
      duration: PropTypes.number,
      timingFunction: PropTypes.string,
      delay: PropTypes.number
    }),

    transitionLeave: PropTypes.shape({
      from: PropTypes.object.isRequired,
      to: PropTypes.object.isRequired,
      duration: PropTypes.number,
      timingFunction: PropTypes.string,
      delay: PropTypes.number
    })
  }

  static defaultProps = {
    className: '',
    duration: 500,
    timingFunction: 'linear'
  }

  wrapChild = child => (
    React.createElement(
      TransitionerGroupChild,
      {
        duration: this.props.duration,
        timingFunction: this.props.timingFunction,
        transitionAppear: this.props.transitionAppear,
        transitionEnter: this.props.transitionEnter,
        transitionLeave: this.props.transitionLeave
      },
      child
    )
  )

  render() {
    return React.createElement(
      TransitionerGroup,
      { ...this.props, childFactory: this.wrapChild }
    )
  }
}
