
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
```

## Release History

* 1.0.0 Initial Release
* 1.0.1 Initial Release
