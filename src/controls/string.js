const React = require('react');

const StringControl = ({ name, value, onChange }) => React.createElement('input', {
  type: 'text',
  name,
  value,
  className: 'form-control',
  autoComplete: 'off',
  onChange: event => onChange(event),
});

export default StringControl;