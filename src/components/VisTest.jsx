import React, { Component, createElement, createRef } from "react";
import classNames from "classnames";
import { DataSet, Network } from "../../node_modules/vis";
import '../../node_modules/vis/dist/vis.css';    //how to import css?, this allowed?

class VisTest extends Component {

  constructor(props) {
    super(props);
    this.network = {};
    this.appRef = createRef();
    this.state = {nodes:[], edges:[], nodesId:[]};
    this.setNodes = this.setNodes.bind(this);
    this.setEdges = this.setEdges.bind(this);
  }

  componentDidMount() {
    mx.data.get({
        xpath: `//${this.props.nodeEntity}`,
        callback: this.setNodes                     //zodra de verbinding met de server is gemaakt voert hij deze functie uit
    });

    mx.data.get({
        xpath: `//${this.props.edgeEntity}`,
        callback: this.setEdges
    });

    console.log("xxxxxxxxx");
    console.log(this);
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

  componentDidUpdate(){                         //wordt elke keer aangroepen wanneer een setState wordt aangeroepen en bij de initiele rendering
    const options = {
        width: "" + this.props.width,
        height: "" + this.props.height,
        physics: {
            stabilization: {
                enabled: true,
                iterations: 10, // maximum number of iteration to stabilize
                updateInterval: 10,
                onlyDynamicEdges: false,
                fit: true
            },
            minVelocity: 0.75,
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

            return {
               id : node.jsonData.guid, 
               label : nodeLabelVar,  
               shape: nodeShapeVar,
               color: "#" + nodeColorVar.slice(1) ,
               font: {
                   color: nodeFontColorVar,
                   size: nodeFontSizeVar  
               },
               size: nodeFontSizeVar,
               mass: nodeMassVar,
               borderWidth: nodeBorderWidthVar
            }        
       });

        const dataEdges = this.state.edges.map((edge, index) =>{            //still needs to be refactored
            console.log("Edge:")
            console.log(edge);
            var edgeLabelVar;
            var edgeLengthVar;
            var edgeTypeToVar;

            if(this.props.edgeLabel === "")         { edgeLabelVar = ""; }
            else                                    { edgeLabelVar = edge.jsonData.attributes[this.props.edgeLabel].value; }
            if(this.props.edgeLength === "")         { edgeLengthVar = "150"; }
            else                                    { edgeLengthVar = edge.jsonData.attributes[this.props.edgeLength].value; }
            if(this.props.edgeTypeTo === "")         { edgeTypeToVar = "arrow"; }
            else                                    { edgeTypeToVar = edge.jsonData.attributes[this.props.edgeTypeTo].value; }

            const from = this.props.edgeAssociationFrom.slice(1,this.props.edgeAssociationFrom.indexOf("/"));
            const to = this.props.edgeAssociationTo.slice(1,this.props.edgeAssociationTo.indexOf("/"));

            return{
                from: edge.jsonData.attributes[from].value,
                to: edge.jsonData.attributes[to].value,
                arrows: {
                    to:     {enabled: true, scaleFactor:1, type: edgeTypeToVar}
                },
                length: edgeLengthVar,
                label: edgeLabelVar 
            }
        });
        console.log("new network created");
        this.network = new Network(this.appRef.current, {nodes : dataNodes, edges :dataEdges}, options);
    }
  }

  render() {                                    //na setState gaat die eerst naar render toe
    return(
      <div ref = {this.appRef}> {this.state.nodes.length === 0 && "loading"}</div>
    );
  }
}

export default VisTest;
