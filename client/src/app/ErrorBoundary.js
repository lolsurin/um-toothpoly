import React from "react";

import { VscError } from "react-icons/vsc";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      //logErrorToMyService(error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return (
            <div className="flex flex-col justify-center items-center m-auto gap-4">
                <div className="text-9xl text-red-500">
                    <VscError />
                </div>
                <div className="font-jakarta text-3xl">Something went wrong :(</div>
                <Link to='/'><p>Go Back Home</p></Link>
            </div>
        )
      }
  
      return this.props.children; 
    }
}

export default ErrorBoundary