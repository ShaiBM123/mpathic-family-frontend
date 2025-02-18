import React from 'react';

interface RoundBtnProps {
  extraClass?: string;
  text: string;
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  iconSrc?: string;
}

const RoundBtn: React.FC<RoundBtnProps> = ({
  extraClass = "",
  text,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  iconSrc,
}) => {
  return (
    <button
      className={`btn custom_button ${extraClass}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {iconSrc && <img className="btn_svg" src={iconSrc} alt="" />}
      <div className="btn_text_wrapper">
        {text}
      </div>
      {loading && <div className="btn_loader"></div>}
    </button>
  );
};

export default RoundBtn;
