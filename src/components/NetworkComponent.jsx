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
        this.state = {
            nodes: [],
            edges: [],
            nodesId: []
        };
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
                this.network.fit();
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

    componentWillUnmount() {
        window.__NetworkGraph = null;
    }

    componentDidUpdate(){
        const options = {
            width: "" + this.props.width,
            height: "" + this.props.height,
            interaction: {
                hover: true
            },

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
                    centralGravity: 0
                }
            }
        };

        if (this.state.nodes.length !== 0) {
            const dataNodes = this.state.nodes.map((node, index) => {
                //Setting default values in case the user did not select an attribute

                const nodeLabelVar = this.props.nodeLabel === '' ? '' : node.get(this.props.nodeLabel);
                const nodeShapeVar = this.props.nodeShape === '' ? '' : node.get(this.props.nodeShape);
                const nodeColorVar = this.props.nodeColor === '' ? '_6F9FD8' : node.get(this.props.nodeColor);
                const nodeFontColorVar = this.props.nodeFontColor === '' ? '' : node.get(this.props.nodeFontColor);
                const nodeFontSizeVar = this.props.nodeFontSize === '' ? 15 : parseInt(node.get(this.props.nodeFontSize));
                const nodeMassVar = this.props.nodeMass === '' ? 1 : parseInt(node.get(this.props.nodeMass));
                const nodeBorderWidthVar = this.props.nodeBorderWidth === '' ? 1 : parseInt(node.get(this.props.nodeBorderWidth));
                const nodeImageVar = this.props.nodeImage === '' ? '' : node.get(this.props.nodeImage);
                const nodeSizeVar = this.props.nodeSize === '' ? 30 : parseInt(node.get(this.props.nodeSize));


                return {
                    id: node.jsonData.guid,
                    label: nodeLabelVar,
                    shape: nodeShapeVar,
                    color: "#" + nodeColorVar.slice(1),
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

            const dataEdges = this.state.edges.map((edge, index) => { //still needs to be refactored

                const edgeLabelVar = this.props.edgeLabel === '' ? '' : edge.get(this.props.edgeLabel);
                const edgeLengthVar = this.props.edgeLength === '' ? 150 : edge.get(this.props.edgeLength);
                const edgeTypeToVar = this.props.edgeTypeTo === '' ? 'arrow' : edge.get(this.props.edgeTypeTo);
                const edgeFontSize = this.props.edgeFontSize === '' ? 12 : parseInt(edge.get(this.props.edgeFontSize));
                const from = this.props.edgeAssociationFrom.slice(1, this.props.edgeAssociationFrom.indexOf("/"));
                const to = this.props.edgeAssociationTo.slice(1, this.props.edgeAssociationTo.indexOf("/"));

                return {
                    from: edge.jsonData.attributes[from].value,
                    to: edge.jsonData.attributes[to].value,
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 1,
                            type: edgeTypeToVar
                        }
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

            this.network = new Network(this.appRef.current, {
                nodes: dataNodes,
                edges: dataEdges
            }, options);

            window.__NetworkGraph = this.network;

            this.network.on("selectNode", (params) => {
                var selectedNodeId = params.nodes[0];
                if (selectedNodeId && this.network.body.nodes[selectedNodeId]) {
                    this.network.body.nodes[selectedNodeId].setOptions({
                        size: 65
                    });
                }
            });

            this.network.on("dragStart", (params) => {
                var selectedNodeId = params.nodes[0];
                if (selectedNodeId && this.network.body.nodes[selectedNodeId]) {
                    this.network.body.nodes[selectedNodeId].setOptions({
                        size: 65
                    });
                }
            });

            this.network.on("deselectNode", (params) => {
                var deselectedNodeId = params.previousSelection.nodes[0];
                if (deselectedNodeId && this.network.body.nodes[deselectedNodeId]) {
                    this.network.body.nodes[deselectedNodeId].setOptions({
                        size: 40
                    });
                }
            });

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

                this.network.on('dragStart', (params) => {
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
