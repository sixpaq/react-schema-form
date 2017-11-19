const React = require('react');
const { get, set, isEqual } = require('lodash');
const { DefaultError, DefaultLabel, DefaultTitle } = require('./controls/defaults');

export class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    const { id, field, onChange } = this.props;
    this.setState({ value: event.target.value });
    if (typeof onChange === 'function') onChange(id, field, event);
  }

  render() {
    const { id, field, components } = this.props;
    let label = null;

    if (!get(field, 'options.noLabel')) {
      const Label = (components || {}).Label || DefaultLabel;
      label = React.createElement(Label, { id, title: field.title });
    }

    let content = null;
    if (field.control && components.controls[field.control]) {
      content = React.createElement(
        components.controls[field.control], {
          type: "text",
          name: field.id,
          value: this.state.value,
          field,
          className: "form-control",
          autoComplete: "off",
          onChange: (event) => this.onChange(event)
      });
    }
    else if (field.type === 'string') {
      content = React.createElement('input', {
          type: "text",
          name: field.id,
          value: this.state.value,
          className: "form-control",
          autoComplete: "off",
          onChange: (event) => this.onChange(event)});
    }

    let errors = null;
    if (field.errors && field.errors.length) {
      const Error = (components || {}).Error || DefaultError;
      errors = field.errors.map((error, i) => (React.createElement(Error, { key: i, error: error })));
    }

    return React.createElement(components.Field || 'div',
      { className: `${field.errors && field.errors.length ? ' has-error' : ''}` },
       [label, content, errors]);
  }
};
