const React = require('react');

export class StringControl extends React.Component {
  render() {
    const { name, value, onChange } = this.props;
    return React.createElement('input', {
      type: 'text',
      name: name,
      value: value,
      className: 'form-control',
      autoComplete: 'off',
      onChange: (event) => onChange(event)});
  }
}
