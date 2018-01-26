const React = require('react');

export const DefaultError = ({ error }) => React.createElement('div', {}, error.message);

export const DefaultLabel = props => React.createElement('label', { className: 'control-label' }, props.title || props.id);

export const DefaultTitle = ({ level, title }) => {
  if (level === 1) return null;
  const h = React.createElement('h3', {}, title);
  return React.createElement('div', { className: 'form-title' }, h);
};