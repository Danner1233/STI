import stiLogo from "../assets/sti.svg";

const LogoEmpresa = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="circleClip">
        <circle cx="50" cy="50" r="45" />
      </clipPath>
    </defs>

    {/* Círculo fondo */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="#1E40AF"
      stroke="#F97316"
      strokeWidth="2"
    />

    {/* Imagen local */}
    <image
      href={stiLogo}
      x="5"
      y="5"
      width="90"
      height="90"
      clipPath="url(#circleClip)"
      preserveAspectRatio="xMidYMid slice"
    />
  </svg>
);

export default LogoEmpresa;
