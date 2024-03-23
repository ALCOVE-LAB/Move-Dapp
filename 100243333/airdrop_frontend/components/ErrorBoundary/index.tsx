import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    console.log("Error::", _.message);
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-grey-900 border-grey-700 mx-auto mt-4 w-1/2 border border-solid p-4 text-center font-bold">
          <span className="block py-2 font-bold ">
            Sorry, there was an unexpected issue !
          </span>
          <span className="block py-2 font-bold ">
            Our team has been notified !
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
