export const AuroraBackground = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 z-[5] overflow-visible bg-white ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          className="absolute -top-[20%] left-[10%] w-[80rem] h-[80rem] bg-gradient-to-tr from-emerald-400 via-cyan-400 to-teal-400 opacity-40 blur-[100px] rounded-[60%]"
          style={{ animation: "auroraFloat1 10s ease-in-out infinite, auroraPulse 6s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute top-[30%] right-[0%] w-[60rem] h-[60rem] bg-gradient-to-bl from-cyan-400 via-emerald-400 to-teal-300 opacity-40 blur-[100px] rounded-[60%]"
          style={{ animation: "auroraFloat2 12s ease-in-out infinite, auroraPulse 7s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute bottom-[10%] left-[25%] w-[70rem] h-[70rem] bg-gradient-to-br from-teal-300 via-cyan-300 to-emerald-300 opacity-40 blur-[100px] rounded-[60%]"
          style={{ animation: "auroraFloat3 14s ease-in-out infinite, auroraPulse 8s ease-in-out infinite" }}
        ></div>
      </div>
    </div>
  );
};