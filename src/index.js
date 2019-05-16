import React from "react";
import {parseStyle} from "./utils/parseStyle";
import NetworkComponent from "./components/NetworkComponent";
import "./style/style.scss";

export default props => {
  const nextProps = {...props, style: parseStyle(props.style)};
  return <NetworkComponent {...nextProps}/>
};
