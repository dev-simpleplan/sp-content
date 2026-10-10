"use client";

export default function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loadingIn">
        <div className="loadingText">
          {"LOADING".split("").map((letter, index) => (
            <span key={`${letter}-${index}`} data-text={letter}>
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
