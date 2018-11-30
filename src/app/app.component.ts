import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Node } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';

/* Draw the nodes and links in an SVG container

   source: https://stackoverflow.com/questions/28102089/simple-graph-of-nodes-and-links-without-using-force-layout
*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'workflow-viz';

  constructor(private parseWorkflowService: ParseWorkflowService) {

    let wfd =
      `<workflow>
    <initial-actions>
        <!-- Display the initial eForm to show LEP Channel data -->
        <action id="1" name="Display LEP Channel">
            <restrict-to>
                <conditions type="AND">
                    <condition type="class">
                        <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                        <!-- FOR INITIAL ACTION 1 USE ROLE CZIP Create Message -->
                        <arg name="roleId">Routing</arg>
                    </condition>
                </conditions>
            </restrict-to>
            <results>
                <unconditional-result old-status="Finished" status="NewMessageCreated" step="1">
                    <post-functions>
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageFunction</arg>
                        </function>
                        <!-- Set any tag you want for this message. Use +[tagname] to add and -[tagname] to remove. Multiples are possible via comma seperation (+Query,-FIN,+Billing) -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                            <arg name="tagInfo">+Display_LEP</arg>
                        </function>
                        <!-- Set comment that will be displayed in the History trail of this message-->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                            <arg name="ipc.messagePrint.comment">Created new LEP Channel message</arg>
                        </function>
                        <!-- Persist changes -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                        </function>
                    </post-functions>
                </unconditional-result>
            </results>
        </action>
    </initial-actions>
    <steps>
        <step id="1" name="Placeholder">
            <actions>
                <action id="101" name="Placeholder">
                    <!-- cancels the current action by only adding history item and jumping back to overview by calling the Navigation Function -->
                    <results>
                        <unconditional-result old-status="Finished" status="Cancel" step="-1">
                            <post-functions>
                                <!-- See incentage help for more details https://doc.incentage.com/display/IPC/Workflow+Functions -->
                                <!-- Terminate the workflow without saving anything -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.NavigationFunction</arg>
                                    <arg name="view">messageProfile</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
            </actions>
        </step>
    </steps>
</workflow>`

    // Test the parser 
    let xml =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<note importance="high" logged="true">' +
      '    <title>Happy</title>' +
      '    <todo>Work</todo>' +
      '    <todo>Play</todo>' +
      '</note>';


    parseWorkflowService.toJs(xml);

    // Initialize the data
    let data = {
      nodes: [{
        name: "A",
        x: 200,
        y: 150
      }, {
        name: "B",
        x: 140,
        y: 300
      }, {
        name: "C",
        x: 300,
        y: 300
      }, {
        name: "D",
        x: 300,
        y: 180
      }],
      links: [{
        source: 0,
        target: 1
      }, {
        source: 1,
        target: 2
      }, {
        source: 2,
        target: 3
      },]
    };

    let svg = d3.select("body")
      .append("svg")
      .attr("width", 1200)
      .attr("height", 800);


    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let drag = d3.drag()
      .on("drag", function (d: Node, i) {
        d.x += d3.event.dx
        d.y += d3.event.dy
        d3.select(this).attr("cx", d.x).attr("cy", d.y);
        links.each(function (l, li) {
          if (l.source == i) {
            d3.select(this).attr("x1", d.x).attr("y1", d.y);
          } else if (l.target == i) {
            d3.select(this).attr("x2", d.x).attr("y2", d.y);
          }
        });
      });

    let links = svg.selectAll("link")
      .data(data.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", function (l) {
        let sourceNode = data.nodes.filter(function (d, i) {
          return i == l.source
        })[0];
        d3.select(this).attr("y1", sourceNode.y);
        return sourceNode.x
      })
      .attr("x2", function (l) {
        let targetNode = data.nodes.filter(function (d, i) {
          return i == l.target
        })[0];
        d3.select(this).attr("y2", targetNode.y);
        return targetNode.x
      })
      .attr("fill", "none")
      .attr("stroke", "white");


    let nodes = svg.selectAll("node")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", function (d) {
        return d.x
      })
      .attr("cy", function (d) {
        return d.y
      })
      .attr("r", 15)
      .attr("fill", function (d, i) {
        return color(i.toString());
      })
      .call(drag);

  }
}
