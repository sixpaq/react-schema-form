import React from 'react';
import { get } from 'lodash';
import { DefaultError, DefaultLabel } from './controls/defaults';

class Field extends React.Component {
  constructor(props) {
    super(props);
    const { field } = props;
    field.untouched = true;

    this.state = {
      value: props.value,
      untouched: true,
    };

    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(event) {
    const { id, field, onChange } = this.props;
    this.setState({ value: event.target.value });
    if (typeof onChange === 'function') onChange(id, field, event);
  }

  onFocus(event) {
    if (this.state.untouched) this.setState(_.extend(this.state, { untouched: false }));
  }

  onBlur(event) {
    const { id, field, onChange } = this.props;
    if (typeof onChange === 'function') onChange(id, field, { target: { value: this.state.value } });
  }

  render() {
    const { id, field, components } = this.props;
    let label = null;

    if (!get(field, 'options.noLabel')) {
      const Label = (components || {}).Label || DefaultLabel;
      label = React.createElement(Label, {
        key: 'label',
        id,
        title: field.title,
        required: field.required,
      });
    }

    let content = null;
    if (field.control && components.controls[field.control]) {
      content = React.createElement(components.controls[field.control], {
        key: 'control',
        type: 'text',
        name: field.id,
        value: this.state.value,
        field,
        className: 'form-control',
        autoComplete: 'off',
        readonly: this.props.readonly,
        onFocus: this.onFocus,
        onChange: this.onChange,
        onBlur: this.onBlur,
      });
    } else if (field.type === 'string') {
      const attributes = {
        key: 'control',
        type: 'text',
        name: field.id,
        value: this.state.value,
        className: 'form-control',
        autoComplete: 'off',
        onFocus: this.onFocus,
        onChange: this.onChange,
        onBlur: this.onBlur,
      };
      if (this.props.readonly) {
        attributes.readOnly = 'readonly';
      }
      content = React.createElement('input', attributes);
    }

    const untouched = this.state.untouched && field.untouched;

    let errors = null;
    if (!untouched && field.errors && field.errors.length) {
      const Error = (components || {}).Error || DefaultError;
      errors = field.errors.map((error, i) => (React.createElement(Error, { key: i, error })));
    }

    const classes = [];
    if (!untouched && field.errors && field.errors.length) classes.push('has-error');
    if (untouched) classes.push('untouched');

    return React.createElement(
components.Field || 'div',
      { className: classes.join(' ') },
      [label, content, errors]
);
  }
}

export default Field;