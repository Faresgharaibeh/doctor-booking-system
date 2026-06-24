let toastFn = null;

export const registerToast = (fn) => {
  toastFn = fn;
};

export const toast = (message, type = "error") => {
  if (toastFn) toastFn(message, type);
};
