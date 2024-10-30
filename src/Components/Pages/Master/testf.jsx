<div className="form-group">
<label
  htmlFor="country"
  className="form-label pb-0 dropdown-label"
>
  Model
</label>
<select
  className="form-select dropdown-select"
  name="country_id"
  // value={formData.data}
  onChange={handleChange}
>
  <option value="">Select Model</option>
  {countries.map((country) => (
    <option key={product.id} value={product.id}>
      {product.item_description}
    </option>
  ))}
</select>
</div>