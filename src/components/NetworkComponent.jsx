import React, { Component, createElement, createRef } from "react";
import { DataSet, Network } from "../../node_modules/vis";
import '../../node_modules/vis/dist/vis.css';

import * as classNames from "classnames";

import ReactResizeDetector from "react-resize-detector";
import {SizeContainer} from './SizeContainer';

class NetworkComponent extends Component {

  constructor(props) {
    super(props);
    this.network = {};
    this.appRef = createRef();
    this.resizeTimer = null;
    this.state = {nodes:[], edges:[], nodesId:[]};
    this.setNodes = this.setNodes.bind(this);
    this.setEdges = this.setEdges.bind(this);
    this.setSize = this.setSize.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    mx.data.get({
        xpath: `//${this.props.nodeEntity}`,
        callback: this.setNodes
    });

    mx.data.get({
        xpath: `//${this.props.edgeEntity}`,
        callback: this.setEdges
    });
  }

  setNodes(nodes){
    this.setState(() => {
        return {nodes: nodes};
      });
  }

  setEdges(edges){
      this.setState(() =>{
          return{edges: edges};
      });
  }

  setSize() {
    if (this.network && this.network.setSize) {
      const parent = this.network.canvas.body.container.parentElement;
      if (parent && parent.offsetWidth && parent.offsetHeight) {
        this.network.setSize(parent.offsetWidth + "px", parent.offsetHeight + "px");
        this.network.redraw();
      }
    }
  }

  onResize(width, height) {
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      this.setSize(width, height);
      this.resizeTimer = null;
    }, 500);
  }

  componentDidUpdate(){
    const options = {
        width: "" + this.props.width,
        height: "" + this.props.height,
        physics: {
          enabled: true,
          minVelocity: 0.75,
            stabilization: {
                enabled: true,
                iterations: 1000, // maximum number of iteration to stabilize
                updateInterval: 10,
                onlyDynamicEdges: false,
                fit: true
            },
            solver: "repulsion",
            repulsion: {
                centralGravity : 0
            }
        }
    };

    if(this.state.nodes.length !== 0 ){
       const dataNodes = this.state.nodes.map((node, index)=> {

            var nodeLabelVar; //default empty string
            var nodeShapeVar; //default circle
            var nodeColorVar; //default blue
            var nodeFontColorVar; //default black
            var nodeFontSizeVar; //default 15
            var nodeMassVar; //default 1
            var nodeBorderWidthVar; //default 1
            var nodeImageVar;
            var nodeSizeVar;

            //Setting default values in case the user did not select an attribute

            if(this.props.nodeLabel === "")         { nodeLabelVar = ""; }
            else                                    { nodeLabelVar = node.jsonData.attributes[this.props.nodeLabel].value; }

            if(this.props.nodeShape === "")         { nodeShapeVar = ""; }
            else                                    { nodeShapeVar = node.jsonData.attributes[this.props.nodeShape].value; }

            if(this.props.nodeColor === "")         { nodeColorVar = "_6F9FD8"; }
            else                                    { nodeColorVar = node.jsonData.attributes[this.props.nodeColor].value; }

            if(this.props.nodeFontColor === "")     { nodeFontColorVar = ""; }
            else                                    { nodeFontColorVar = node.jsonData.attributes[this.props.nodeFontColor].value; }

            if(this.props.nodeFontSize === "")      { nodeFontSizeVar = 15; }
            else                                    { nodeFontSizeVar = parseInt(node.jsonData.attributes[this.props.nodeFontSize].value); }

            if(this.props.nodeMass === "")          { nodeMassVar = 1; }
            else                                    { nodeMassVar = node.jsonData.attributes[this.props.nodeMass].value; }

            if(this.props.nodeBorderWidth === "")   { nodeBorderWidthVar = 1; }
            else                                    { nodeBorderWidthVar = node.jsonData.attributes[this.props.nodeBorderWidth].value; }

            if(this.props.nodeImage === "")         { nodeImageVar = ''; }
            else                                    { nodeImageVar = node.jsonData.attributes[this.props.nodeImage].value; }

            if(this.props.nodeSize === "")          { nodeSizeVar = 30; }
            else                                    { nodeSizeVar = parseInt(node.jsonData.attributes[this.props.nodeSize].value); }

            return {
               id : node.jsonData.guid,
               label : nodeLabelVar,
               shape: nodeShapeVar,
               color: "#" + nodeColorVar.slice(1) ,
               font: {
                   color: nodeFontColorVar,
                   size: nodeFontSizeVar,
                   face: 'open sans'
               },
               mass: nodeMassVar,
               borderWidth: nodeBorderWidthVar,
               image: nodeImageVar,
               size: nodeSizeVar
            }
       });

      const dataEdges = this.state.edges.map((edge, index) =>{            //still needs to be refactored
          var edgeLabelVar;
          var edgeLengthVar;
          var edgeTypeToVar;
          var edgeFontSize;

          if(this.props.edgeLabel === "")         { edgeLabelVar = ""; }
          else                                    { edgeLabelVar = edge.jsonData.attributes[this.props.edgeLabel].value; }
          if(this.props.edgeLength === "")         { edgeLengthVar = "150"; }
          else                                    { edgeLengthVar = edge.jsonData.attributes[this.props.edgeLength].value; }
          if(this.props.edgeTypeTo === "")         { edgeTypeToVar = "arrow"; }
          else                                    { edgeTypeToVar = edge.jsonData.attributes[this.props.edgeTypeTo].value; }
          if(this.props.edgeFontSize === "")         { edgeFontSize = 12; }
          else                                    { edgeFontSize = parseInt(edge.jsonData.attributes[this.props.edgeFontSize].value); }

          const from = this.props.edgeAssociationFrom.slice(1,this.props.edgeAssociationFrom.indexOf("/"));
          const to = this.props.edgeAssociationTo.slice(1,this.props.edgeAssociationTo.indexOf("/"));

          return{
              from: edge.jsonData.attributes[from].value,
              to: edge.jsonData.attributes[to].value,
              arrows: {
                  to:     {enabled: true, scaleFactor:1, type: edgeTypeToVar}
              },
              length: edgeLengthVar,
              label: edgeLabelVar,
              font: {
                size: edgeFontSize,
                face: 'open sans',
                background: '#EBECED',
                bold: {
                  size: edgeFontSize, // px
                  face: 'open sans',
                  vadjust: 0,
                  mod: 'bold'
                },
              }
          }
      });

      this.network = new Network(this.appRef.current, {nodes : dataNodes, edges :dataEdges}, options);

      if (this.props.messageMicroflow) {
        this.network.on('click', (params) => {
          if (params.nodes && params.nodes.length > 0) {
            const guids = params.nodes;
            mx.data.action({
              params: {
                actionname: this.props.messageMicroflow,
                applyto: "selection",
                guids
              },
              origin: this.mxform,
              callback: () => {
                console.log('Microflow ' + this.props.messageMicroflow + ' executed with guids: ', guids);
              },
              error: err => {
                mx.ui.error("Something went wrong when executing microflow");
              }
            })
          }
        })
      }
    }
  }

  render() {
    const { className } = this.props;
    return <SizeContainer
      {...this.props}
      className={classNames("widget-network-visualizer", className)}
    >
      <div ref={this.appRef}> {this.state.nodes.length === 0 && "loading"}</div>
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
    </SizeContainer>
  }
}

export default NetworkComponent;
