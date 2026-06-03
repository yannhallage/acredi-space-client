import React from "react";
import "./Toast.css";

export type ToastIntent = "success" | "info" | "warning" | "error";

type ToastProps = {
  intent?: ToastIntent;
  message: string;
};

const toastConfig = {
  success: {
    icon: "v",
    text: "Toast intent: success",
  },
  info: {
    icon: "i",
    text: "Toast intent: info",
  },
  warning: {
    icon: "!",
    text: "Toast intent: warning",
  },
  error: {
    icon: "x",
    text: "Toast intent: error",
  },
};

export default function Toast({ intent = "success", message }: ToastProps) {
  const config = toastConfig[intent];

  return (
    <div className="toast">
      <div className={`toast-icon toast-${intent}`}>
        {config.icon}
      </div>

      <strong className="toast-message">
        {message || config.text}
      </strong>
    </div>
  );
}
