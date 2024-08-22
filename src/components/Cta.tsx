type Props = {
  ctaClass?: string;
  title?: string;
  text?: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

const ComponentName: React.FC<Props> = ({
  ctaClass,
  title,
  text,
  icon,
  onClick,
}) => {
  return (
    <div className="cta-box">
      <button
        className={`cta-btn ${ctaClass && { ctaClass }}`}
        onClick={onClick}
      >
        {icon && <span className="icon">{icon}</span>}
        {text && <span className="text">{text}</span>}
      </button>
      {title && <p>{title}</p>}
    </div>
  );
};

export default ComponentName;
