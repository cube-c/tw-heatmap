/*\
title: $:/plugins/cube-c/heatmap/heatmap.js
type: application/javascript
module-type: widget
\*/
(function () {
    "use strict";

    var Widget = require("$:/core/modules/widgets/widget.js").widget;

    function HeatmapWidget(parseTreeNode, options) {
        Widget.call(this, parseTreeNode, options);
        this.offset = 0;
    }

    HeatmapWidget.prototype = Object.create(Widget.prototype);

    HeatmapWidget.prototype.render = function (parent, nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();

        var self = this;
        var children = this.children;
        var nodeRoot = this.document.createElement("div");
        nodeRoot.className = "heatmap";
        parent.insertBefore(nodeRoot, nextSibling);

        // left button
        var nodeButton = this.document.createElement("button");
        nodeButton.textContent = "❮";
        nodeButton.addEventListener("click", function(event) {
            self.offset--;
            self.refreshSelf();
            return true;
        });
        nodeRoot.insertBefore(nodeButton, null);

        // year text
        var nodeYear = this.document.createElement("span");
        nodeYear.textContent = this.globalYear
        nodeRoot.insertBefore(nodeYear, null);

        // right button
        var nodeButton = this.document.createElement("button");
        nodeButton.textContent = "❯";
        nodeButton.addEventListener("click", function(event) {
            self.offset++;
            self.refreshSelf();
            return true;
        });
        nodeRoot.insertBefore(nodeButton, null);

        // Table
        var nodeHeatmap = this.document.createElement("table");
        nodeRoot.insertBefore(nodeHeatmap, null);

        var nodeHeatmapBody = this.document.createElement("tbody");
        nodeHeatmap.insertBefore(nodeHeatmapBody, null);

        var nodeTds = [];

        for (var i = 0; i < this.rows; i++) {
            var nodeTr = this.document.createElement("tr");
            nodeTr.style.height = this.height;

            nodeHeatmapBody.insertBefore(nodeTr, null);
            nodeTds[i] = [];

            for (var j = 0; j < this.columns; j++) {
                var nodeTd = this.document.createElement("td");
                nodeTd.style.height = this.height;
                nodeTd.style.width = this.height;
                nodeTds[i][j] = nodeTd;

                nodeTr.insertBefore(nodeTd, null);
            }
        }

        for (var i = 0; i < children.length; i++) {
            var row = children[i].parseTreeNode.row;
            var column = children[i].parseTreeNode.column;
            children[i].render(nodeTds[row][column], null);
        }

        this.domNodes.push(nodeRoot);
    };

    HeatmapWidget.prototype.execute = function () {
        var now = new Date();
        this.globalYear = now.getFullYear() + this.offset;
        this.height = "9px";
        this.rows = 7;
        this.columns = 0;

        var date = new Date(this.globalYear, 0);
        var members = [];
        var format = this.getAttribute("format", "DDth MMM YYYY");
        var column = 0;

        while (date.getFullYear() == this.globalYear) {
            var title = $tw.utils.formatDateString(date, format);
            var day = date.getDay();

            this.columns = column + 1; // Update column count
            members.push({
                type: "listitem",
                itemTitle: title,
                variableName: "currentTiddler",
                children: this.parseTreeNode.children,
                column: column,
                row: day,
            });

            date.setDate(date.getDate() + 1);

            if (day == 6) {
                column++;
            }
        }

        this.makeChildWidgets(members);
    };

    HeatmapWidget.prototype.refresh = function (changedTiddlers) {
        // TODO: fix this
        return false;
    };

    exports.heatmap = HeatmapWidget;

    function HeatmapItemWidget(parseTreeNode, options) {
        Widget.call(this, parseTreeNode, options);
    }

    HeatmapItemWidget.prototype = Object.create(Widget.prototype);

    HeatmapItemWidget.prototype.render = function (parent, nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();

        var domNode = this.document.createElement("div");
        this.domNode = domNode;

        domNode.className = "heatmap-outline color-" + Math.min(Math.ceil(this.value * 0.25), 4);
        domNode.style.height = "9px";
        domNode.style.width = "9px";

        parent.insertBefore(domNode, nextSibling);
        this.renderChildren(domNode, null);
        this.domNodes.push(domNode);
    };

    HeatmapItemWidget.prototype.execute = function () {
        this.setVariable("currentTiddler", this.parseTreeNode.title);
        this.value = this.getAttribute("value", "0");
        this.makeChildWidgets();
    };

    HeatmapItemWidget.prototype.refresh = function (changedTiddlers) {
        return this.refreshChildren(changedTiddlers);
    };

    exports.heatmapitem = HeatmapItemWidget;
})();
