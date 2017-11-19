const React = require('react');
const { get, set, isEqual } = require('lodash');

export class DefaultError extends React.Component {
  render() {
    const { error } = this.props;
    return React.createElement('div', {}, error.message);
  }
}

export class DefaultLabel extends React.Component {
  render() {
    var props = this.props;
    return React.createElement('label', { className: 'control-label' }, props.title || props.id);
  }
}

export class DefaultTitle extends React.Component {
  render() {
    var { level, title } = this.props;
    if (level === 1) return null;
    const h = React.createElement('h3', {}, title);
    return React.createElement('div', { className: 'form-title' }, h);
  }
}

