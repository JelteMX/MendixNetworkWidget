import React from "react";
//import VisTest from "../components/VisTest";
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
    this.up = this.up.bind(this);
    this.down = this.down.bind(this);
  }
  down() {
    this.setState(state => ({count: state.count - 1}));
  }
  up() {
    this.setState(state => ({count: state.count + 1}));
  }
  render() {
    return (
      <div className={`react-counter ${this.props.class}`} style={this.props.style}>
        <div className="counter-header">
          <span>•••</span>
          <h1>
            {this.props.dummyKey}
          </h1>
          <span>•••</span>
        </div>
        <h1 className="counter-count">
          {this.state.count}
        </h1>
        <div className="controls-wrapper">
          <button className="counter-btn" onClick={this.down}>
            -
          </button>
          <button className="counter-btn" onClick={this.up}>
            +
          </button>
        </div>
      </div>
    );
  }
}

export default Counter;
