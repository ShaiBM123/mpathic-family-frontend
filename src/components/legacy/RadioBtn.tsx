const RadioBtn = ({
  extraClass = "",
  radioId,
  radioName,
  labelText,
  value,
  checked,
  onChange,
  labelClass = "",
  onClick
}: any) => {
  return (
    <div className={`form-check ${extraClass} `}>
      <input
        type="radio"
        id={radioId}
        className="radio_checked form-check-radio"
        value={value}
        checked={checked}
        onChange={onChange}
        name={radioName}
        required
        onClick={onClick}
      />
      <label className={`form-check-label ${labelClass}`} htmlFor={radioId}>
        {labelText}
      </label>
    </div>
  );
};

export default RadioBtn;
