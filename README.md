# react-schema-form
Easy form component with json schema definition

```javascript
render() {
  <Form name="MyForm" schema="sampleSchema" onSubmit={this.onSubmit} />
}
```

### Sample schema 1:
```javascript
{
  title: 'Main Title',
  properties: {
    lastname: { type: 'string', id: 'customer.lastname', required: true },
    initials: { type: 'string', id: 'customer.initials', required: true },
    street: { type: 'string', id: 'customer.address.street', required: true },
    city: { type: 'string', id: 'customer.address.city', required: true },
  }
}
```
