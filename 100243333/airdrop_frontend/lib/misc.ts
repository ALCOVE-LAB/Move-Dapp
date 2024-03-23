export function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

export function getSocketBaseUrl() {
  const wsUrl = process.env.NEXT_PUBLIC_WEB_SOCKET_BASE_URL as string;
  return wsUrl;
}

export function getQueryString(params: Record<string, any>) {
  const queryString = Object.keys(params)
    .sort()
    .map((key) => {
      return (
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key] || "")
      );
    })
    .join("&");
  return queryString;
}
