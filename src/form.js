import React from 'react';
import { get, set, isEqual, extend } from 'lodash';
import { Fade } from 'react-reveal';
import { DefaultError, DefaultLabel, DefaultTitle } from './controls/defaults';
import StringControl from './controls/string';
import Field from './field';

class Form extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onSubmit = this.onSubmit.bind(this);
    this.renderSchema = this.renderSchema.bind(this);
    this.onChange = this.onChange.bind(this);
    this.touchSchema = this.touchSchema.bind(this);
    this.state = extend({
      data: props.data || {},
      errors: {},
    }, props.controls || {});

    this.components = {
      Label: DefaultLabel,
      Title: DefaultTitle,
      Error: DefaultError,
      controls: {
        'string': StringControl,
      },
    };
    if (props.components) {
      this.components = extend(this.components, props.components);
    }

    this.validateSchema();
  }

  hasErrors() {
    let count = 0;
    Object.values(this.state.errors || {}).forEach((error) => {
      count += error ? error.length : 0;
    });
    return count !== 0;
  }

  onSubmit() {
    this.touchSchema();
    this.validateSchema();
    if (typeof this.props.onSubmit === 'function') this.props.onSubmit(this.state.data, !this.hasErrors());
  }

  touchSchema() {
    const { schema } = this.props;

    const touchProperties = (properties) => {
      if (properties instanceof Array) {
        properties.forEach(p => touchProperties(p));
        return;
      }
      Object.values(properties).forEach((prop) => {
        if (prop && prop.properties) {
          touchProperties(prop.properties);
        } else {
          prop.untouched = false;
        }
      });
    };

    touchProperties(schema.properties);
    this.setState(this.state);
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

      if (emit) {
        const errorList = [];
        Object.keys(state.errors).forEach((key) => {
          const error = state.errors[key];
          error.map(e => errorList.push(e));
        });

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
      Object.keys(properties).forEach((p) => {
        const o = properties[p];
        if (o && o.properties) {
          validateProperties(o.properties);
        } else {
          const value = get(this.state.data, o.id);
          this.validateField(o, value, true);
        }
      });
    };

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
      field,
      value,
      readonly: (field.readonly || this.props.readonly),
      components: this.components,
      onChange: this.onChange,
    });
  }

  renderProperties(id, properties, schema) {
    if (properties instanceof Array) {
      return properties.map((p, i) => this.renderProperties(`${id}.${i}`, p, schema));
    }
    const fields = [];
    Object.keys(properties).forEach((p, index) => {
      const o = properties[p];
      if (o.properties) {
        o.level = schema.level + 1;
        fields.push(this.renderSchema(`${id}.${p}`, o, index));
      } else {
        fields.push(this.renderField(`${id}.${p}`, o, index));
      }
    });
    return React.createElement('div', { key: `prop.${id}`, className: 'form-row' }, fields);
  }

  renderSchema(id, schema, index) {
    const Title = this.components.Title || DefaultTitle;
    return (
      <div key={`schema.${id}`} className="form-block">
        <Fade left delay={index * 100} big>
          <Title level={schema.level} title={schema.title} />
          {schema.properties ? this.renderProperties(id, schema.properties, schema) : null}
        </Fade>
      </div>
    );
    // return React.createElement('Fade', { right: true }, [
    //   React.createElement('div', { key: `schema.${id}`, className: "form-block" }, [
    //     React.createElement(Title, {key: 'title', level: schema.level, title: schema.title}),
    //     schema.properties ? this.renderProperties(id, schema.properties, schema) : null,
    //   ]),
    // ]);
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
      children,
    ]);
  }
}

export default Form;