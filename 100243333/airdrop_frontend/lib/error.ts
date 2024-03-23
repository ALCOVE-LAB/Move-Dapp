export const getErrMsg = (error?: any) => {
  let refError = error;
  let reason: string | undefined;
  while (refError) {
    reason = refError.reason ?? refError.message ?? reason;
    refError = refError.error ?? refError.data?.originalError;
  }

  const message =
    reason ||
    error?.message ||
    error?.response?.data ||
    error?.response?.message ||
    JSON.stringify(error?.response);
  return message;
};
