function Topology(svg) {
    typeof(svg) == 'string' && (svg = document.getElementById(svg));
    var w = svg.parentNode.clientWidth,
        h = svg.parentNode.clientHeight,
        self = this;

    this.vis = d3.select(svg)
        .attr("width", w)
        .attr("height", h)
        .attr("pointer-events", "all");

    this.force = d3.layout.force()
        .gravity(.05)
        .linkDistance(200)
        .charge(-400)
        .size([w, h])
        .on("tick", function(x) {
            self.vis.selectAll(".node")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            self.vis.selectAll(".link")
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            self.vis.selectAll(".srcPortTxt")
                .attr("x", function(d) {
                    return self.offsetByLine(d, 40).x;
                })
                .attr("y", function(d) {
                    return self.offsetByLine(d, 40).y;
                });

            self.vis.selectAll(".dstPortTxt")
                .attr("x", function(d) {
                    return self.offsetByLine(d, -40).x;
                })
                .attr("y", function(d) {
                    return self.offsetByLine(d, -40).y;
                });
        });

    this.nodes = this.force.nodes();
    this.links = this.force.links();

    this.mouseoverLinkHandler = function() {};
    this.mouseoutLinkHandler = function() {};
    this.mouseoverNodeHandler = function() {};
    this.mouseoutNodeHandler = function() {};
    this.dblclickNodeHandler = function() {};
    this.clickAHandler = function() {};

}


Topology.prototype.addNode = function(node) {
    this.nodes.push(node);
}

Topology.prototype.addNodes = function(nodes) {
    if (Object.prototype.toString.call(nodes) == '[object Array]') {
        var self = this;
        nodes.forEach(function(node) {
            self.addNode(node);
        });
    }
}

Topology.prototype.addLink = function(link) {
    link.source = this.findNode(link['source']);
    link.target = this.findNode(link['target']);
    this.links.push(link);
}

Topology.prototype.addLinks = function(links) {
    if (Object.prototype.toString.call(links) == '[object Array]') {
        var self = this;
        links.forEach(function(link) {
            self.addLink(link);
        });
    }
}


Topology.prototype.findNode = function(id) {
    var nodes = this.nodes;
    for (var i in nodes) {
        if (nodes[i]['id'] == id) return nodes[i];
    }
    return null;
}


Topology.prototype.findNodeIndex = function(id) {
    var nodes = this.nodes;
    for (var i in nodes) {
        if (nodes[i]['id'] == id) return i;
    }
    return -1;
}


Topology.prototype.updateLinks = function() {
    var link = this.vis.selectAll(".link")
        .data(this.links, function(d) {
            return d.source.id + "-" + d.target.id;
        });

    var linkEnter = link.enter().append("g")
        .attr("class", "lineGroup")
        .on("mouseover", this.mouseoverLinkHandler)
        .on("mouseout", this.mouseoutLinkHandler);

    linkEnter.append("line")
        .attr("class", 'link')
        .attr("marker-end", "url(#markerEnd)")
        .attr("marker-start", "url(#markerStart)");
    linkEnter.append("text")
        .attr("class", "linetext srcPortTxt")
        .text(function(d) {
            return d.src_port;
        });
    linkEnter.append("text")
        .attr("class", "linetext dstPortTxt")
        .text(function(d) {
            return d.dst_port;
        });

    link.exit().remove();
}

Topology.prototype.updateNodes = function() {
    var node = this.vis.selectAll(".node")
        .data(this.nodes, function(d) {
            return d.id;
        });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .on("mouseover", this.mouseoverNodeHandler)
        .on("mouseout", this.mouseoutNodeHandler)
        .on("dblclick", this.dblclickNodeHandler)
        .call(this.force.drag);

    var self = this;

    nodeEnter.append("circle")
        .attr("class", "nodeCircle")
        .attr("r", "28");

    //Use Image
    nodeEnter.append("image")
        .attr("class", "nodeImg")
        .attr("xlink:href", function(d) {
            return d.type + ".png";
        })
        .attr("x", -16)
        .attr("y", -16)
        .attr("width", 32)
        .attr("height", 32);

    nodeEnter.append("a")
        .attr("xlink:href", function(d) {
            return "#" + d.id;
        })
        .on("click", this.clickAHandler)
        .append("text")
        .attr("class", "nodetext")
        .attr("dx", 0)
        .attr("dy", -35)
        .text(function(d) {
            return d.mip;
        });

    node.exit().remove();
}

Topology.prototype.update = function() {
    this.updateLinks();
    this.updateNodes();

    this.force.start();
}

Topology.prototype.init = function(data) {
    this.addNodes(data.nodes);
    this.addLinks(data.links);

    this.update();
}

Topology.prototype.offsetByLine = function(d, offset) {
    var x1 = d.source.x;
    var y1 = d.source.y;
    var x2 = d.target.x;
    var y2 = d.target.y;
    var x_shift = x2 - x1;
    var y_shift = y2 - y1;
    var l = Math.sqrt(x_shift * x_shift + y_shift * y_shift);
    var o = offset / l;

    if (offset > 0) {
        return {
            x: x_shift * o + x1,
            y: y_shift * o + y1 + 3
        };
    } else {
        return {
            x: x_shift * o + x2,
            y: y_shift * o + y2 + 3
        };
    }
}
