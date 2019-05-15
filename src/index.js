import React from "react";
import Counter from "./components/Counter";
import {parseStyle} from "./utils/parseStyle";
import VisTest from "./components/VisTest";


//import styles
import "./style/style.scss";

export default props => {

  const nextProps = {...props, style: parseStyle(props.style)};
  //console.log(nextProps);
  //return <Counter {...nextProps} />;
  return <VisTest {...nextProps}/>
};
