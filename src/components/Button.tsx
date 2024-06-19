type Props = {
  className?: string;
  title?: string;
  titleClass?: string;
  text?: string;
  onClick?: () => void;
};

const Button: React.FC<Props> = ({
  className,
  title,
  titleClass,
  text,
  onClick,
}) => {
  return (
    <div className="btn-container">
      {title ? <h2 className={`btn-title ${titleClass}`}>{title}</h2> : <h2 className="btn-title">Sound One</h2>}
      <button className={`prm-btn ${className}`} onClick={onClick}>
        {text}
      </button>
    </div>
  );
};

export default Button;
