import React from "react";
import ReactDOM from "react-dom";

const { TARGET } = window.APP_CONFIG;

class App extends React.Component {
    render() {
        return <div>{`Hello ${TARGET}!`}</div>;
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
