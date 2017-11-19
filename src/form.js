const React = require('react');
const { get, set, isEqual } = require('lodash');

class DefaultError extends React.Component {
  render() {
    const { error } = this.props;
    return React.createElement('div', {}, error.message);
  }
}

class DefaultLabel extends React.Component {
  render() {
    var props = this.props;
    return React.createElement('label', { className: 'control-label' }, props.title || props.id);
  }
}

class DefaultTitle extends React.Component {
  render() {
    var { level, title } = this.props;
    if (level === 1) return null;
    const h = React.createElement('h3', {}, title);
    return React.createElement('div', { className: 'form-title' }, h);
  }
}

class Field extends React.Component {
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
    if (field.type === 'string') {
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

    return React.createElement('div',
      { className: `col-xs-4${field.errors && field.errors.length ? ' has-error' : ''}` },
       [label, content, errors]);
  }
};

export class Form extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onSubmit = this.onSubmit.bind(this);
    this.renderSchema = this.renderSchema.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      data: props.data || {},
      errors: {},
    };

    this.validateSchema();
  }

  hasErrors() {
    let count = 0;
    for(let key in (this.state.errors || {})) {
      const error = (this.state.errors || {})[key];
      count += error ? error.length : 0;
    }
    console.log('hasErrors', count);
    return count !== 0;
  }

  onSubmit() {
    if (this.hasErrors()) return;
    if (typeof this.props.onSubmit === 'function') this.props.onSubmit(this.state.data);
  }

  validateField(field, value, emit) {
    const errors = [];

    if (field.required && !value) {
      errors.push({ id: field.id, code: 'required', message: `${field.id} is required` });
    }

    if (typeof field.validation === 'function') {
      const v = field.validation({
        id: field.id,
        value,
        field,
      });
      if (v && v.length) v.map(e => errors.push(e));
    }

    const state = this.state || {};
    if (!isEqual(field.errors, errors)) {
      field.errors = errors;
      state.errors[field.id] = errors;

      // this.setState(state);

      if (emit) {
        const errorList = [];
        for(let key in state.errors) {
          const error = state.errors[key];
          error.map(e => errorList.push(e));
        }

        const { onValidate } = this.props;
        if (typeof onValidate === 'function') {
          onValidate(errorList);
        }
      }
    }
  }

  validateSchema() {
    const { schema } = this.props;

    const validateProperties = (properties) => {
      if (properties instanceof Array) {
        properties.forEach(p => validateProperties(p));
        return;
      }
      for (let p in properties) {
        const o = properties[p];
        if (o && o.properties) {
          validateProperties(o.properties);
        } else {
          const value = get(this.state.data, o.id);
          this.validateField(o, value, true);
        }
      };
    }

    validateProperties(schema.properties);
  }

  onChange(id, field, event) {
    const state = this.state || {};
    set(state.data, field.id, event.target.value);
    this.validateField(field, event.target.value, true);
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(state.data);
    }
  }

  renderField(id, field) {
    const value = get(this.state.data, field.id);
    field.errors = this.state.errors[field.id];
    return React.createElement(Field, {
      key: field.id,
      id: field.id,
      field: field,
      value: value,
      components: this.props.components,
      onChange: this.onChange
    });
  }

  renderProperties(id, properties, schema) {
    if (properties instanceof Array) {
      return React.createElement('div', {}, 
        properties.map((p, i) => this.renderProperties(`${id}.${i}`, p, schema)));
    } else {
      const fields = [];
      for (let p in properties) {
        const o = properties[p];
        if (o.properties) {
          o.level = schema.level + 1;
          fields.push(this.renderSchema(`${id}.${p}`, o));
        } else {
          fields.push(this.renderField(`${id}.${p}`, o));
        }
      }
      return React.createElement('div', { key: `prop.${id}`, className: "form-row" }, fields);
    }
  }

  renderSchema(id, schema) {
    const { components } = this.props;
    const Title = (components || {}).Title || DefaultTitle;
    return React.createElement('div', { key: `schema.${id}`, className: "form-block" }, [
      React.createElement(Title, {level: schema.level, title: schema.title}),
      schema.properties ? this.renderProperties(id, schema.properties, schema) : null
    ]);
  }

  renderContent() {
    const { schema, name } = this.props;
    schema.level = 1;
    return this.renderSchema(name || 'root', schema);
  }

  render() {
    const { children } = this.props;
    return React.createElement('form', { onSubmit: (e) => { e.preventDefault(); this.onSubmit(); } }, [
      this.renderContent(),
      children
    ]);
  }
}
