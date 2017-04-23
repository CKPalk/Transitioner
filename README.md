
Transitioner
============

A Transition library providing access to transitions without any CSS files.
Inject style changes directly to children rather than using static stylesheets.

## Installation

  npm install transitioner --save

## Usage

```javascript
  <Transitioner
    timingFunction={String?}
    duration={Number?}
    transitionAppear={TransitionDetailsObject?}
    transitionEnter={TransitionDetailsObject?}
    transitionLeave={TransitionDetailsObject?}
  />

  TransitionDetailsObject = {
    duration: Number?,
    delay: Number?,
    timingFunction: String?,
    from: { /* Styles at start */ },
    to: { /* Styles at end */ }
  }


  // Example
  const Transitioner = require('transitioner')
  const TimingFunctions = Transitioner.timingFunctions

  const transitionIn = {
    from: { top: '-100%', opacity: 0 },
    to  : { top: 0,       opacity: 1 },
  }
  const transitionOut = {
    from: { top: 0,      opacity: 1 },
    to  : { top: '100%', opacity: 0 }
  }

  <Transitioner
    duration={750}
    delay={0}
    timingFunction={TimingFunctions.quad.easeIn}
    transitionAppear={{ ...transitionIn, delay: 500 }}
    transitionEnter={transitionIn}
    transitionLeave={transitionOut}
  >
    {children}
  </Transitioner>

```

## Release History

* 1.0.0 Initial Release
* 1.0.2 Transpiler added
* 1.0.4 Added React dependency
