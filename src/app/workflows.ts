const xmlSimple: string = `<?xml version="1.0" encoding="utf-8"?>
    <workflow>
  <initial-actions>
    <action id="2" name="go to step 1" view="RetrieveMandate">
      <results>
        <unconditional-result status="NewMessageCreated" step="1">
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <steps>
    <step id="1" name="Step 1">
      <actions>
        <action id="101" name="go to step 2">
          <results>
            <unconditional-result status="RequestGenerated" step="2">
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="go to step 3">
          <results>
            <unconditional-result status="Cancel" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="2" name="Step 2">
      <actions>
        <action id="201" name="go to step 3">
          <results>
            <unconditional-result status="RequestGenerated" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="3" name="Step 3">
      <actions>
        <action id="301" name="go to step 4">
          <results>
            <unconditional-result status="RequestGenerated" step="4">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
  <step id="4" name="Step 4">
      <actions>
        <action id="401" name="go to final step">
          <results>
            <unconditional-result status="RequestGenerated" step="-1">
            </unconditional-result>
          </results>
        </action>
        <action id="402" name="go to step 2">
          <results>
            <unconditional-result status="Back to 2" step="2">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    </steps>
</workflow>`;

const xmlLong: string = `<?xml version="1.0" encoding="utf-8"?>
<workflow>
  <initial-actions>
    <action id="1" name="Create message">
      <restrict-to>
        <conditions type="AND">
          <condition type="beanshell">
            <arg name="script"> String sendersMessageReferenceUC = transientVars.get("sendersMessageReference");
                            if(sendersMessageReferenceUC != null) {
                                sendersMessageReferenceUC = sendersMessageReferenceUC.toUpperCase();
                                propertySet.setAsActualType("sendersMessageReferenceUC", sendersMessageReferenceUC); }
                            String messageUserReferenceUC = transientVars.get("messageUserReference");
                            if (messageUserReferenceUC != null) {
                                messageUserReferenceUC = messageUserReferenceUC.toUpperCase();
                                propertySet.setAsActualType("messageUserReferenceUC", messageUserReferenceUC); }
                            String logicalTerminalAddressUC = transientVars.get("logicalTerminalAddress");
                            if (logicalTerminalAddressUC != null) {
                                logicalTerminalAddressUC = logicalTerminalAddressUC.toUpperCase();
                                propertySet.setAsActualType("logicalTerminalAddressUC", logicalTerminalAddressUC); }
                            String destinationAddressUC = transientVars.get("destinationAddress");
                            if (destinationAddressUC != null) {
                                destinationAddressUC = destinationAddressUC.toUpperCase();
                                propertySet.setAsActualType("destinationAddressUC", destinationAddressUC); }
                            return true;
            </arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Saved" step="1">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">G</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">serviceFormatId</arg>
              <arg name="attribute.value">100</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.D_ATT_1</arg>
              <arg name="attribute.value">{actionTimestamp}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.C_ATT_1</arg>
              <arg name="attribute.value">{callerUserName}/{callerUserProfileId}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">reference1</arg>
              <arg name="attribute.value">{sendersMessageReferenceUC}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">reference2</arg>
              <arg name="attribute.value">{messageUserReferenceUC}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.sender</arg>
              <arg name="attribute.value">{logicalTerminalAddressUC}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.receiver</arg>
              <arg name="attribute.value">{destinationAddressUC}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+created</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">New message created</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
            <function type="beanshell">
              <arg name="script"> Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid); </arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="11" name="Correct NAK" view="EnterOptionalComment">
      <meta name="ipc.message.tag.id">100</meta>
      <meta name="ipc.initialaction.flowstep.displayname">NAK</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <!-- Only display still active messages -->
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">active</arg>
            <arg name="comparisonOperator">a:=</arg>
            <arg name="attribute.value">true</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Creation" step="1">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">G</arg>
            </function>
            <function type="beanshell">
              <arg name="script"> propertySet.setAsActualType("inc.message_origin", "repair"); </arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+edited</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">{comment}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="12" name="Complete NAK" view="EnterOptionalComment">
      <meta name="ipc.message.tag.id">100</meta>
      <meta name="ipc.initialaction.flowstep.displayname">NAK</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <!-- Only display still active messages -->
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">active</arg>
            <arg name="comparisonOperator">a:=</arg>
            <arg name="attribute.value">true</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Resolved" step="10">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <!-- Mark message as complete -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">active</arg>
              <arg name="attribute.value">false</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+edited</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">{comment}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="21" name="Correct Inbound Error" view="EnterOptionalComment">
      <meta name="ipc.message.tag.id">460</meta>
      <meta name="ipc.initialaction.flowstep.displayname">Inbound Error</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">101</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">460</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Release" step="9">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">G</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+edited</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">{comment}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="31" name="Create n95 query" view="EnterOptionalComment">
      <!-- Queries can be created and called for all SWIFT FIN Messages either to request more information
                 on a previously sent message or to ask about a received message -->
      <meta name="ipc.initialaction.flowstep.displayname">Messages</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.action.allowbulking">false</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.tag.id">584</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">584</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Reply" step="7">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">n95 Query created by {callerUserName}</arg>
            </function>
            <!-- call the service request to generate a new n95 Query message -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
              <arg name="ipc.serviceRequest.requestType">replyn95</arg>
              <arg name="ipc.serviceRequest.parameter">{callerUserName}: {comment}</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="32" name="Create n96 response" view="EnterOptionalComment">
      <!-- Response/Answer n96 msgs can be created and sent in reply to msgs received from counterparties.
                 n69 messages are possible in response to n95, n96 and n99 -->
      <meta name="ipc.initialaction.flowstep.displayname">Messages</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.action.allowbulking">false</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.tag.id">584</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">584</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Reply" step="7">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">n95 Query created by {callerUserName}</arg>
            </function>
            <!-- call the service request to generate a new n95 Query message -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
              <arg name="ipc.serviceRequest.requestType">replyn95</arg>
              <arg name="ipc.serviceRequest.parameter">{callerUserName}: {comment}</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="33" name="Create n92 cancellation" view="EnterOptionalComment">
      <!-- n92 cancellation msgs can be created and sent only for outbound messages that where previously sent from the local system.
                 You can only cancel your own messages.
                 n69 messages are possible for most FIN messages however not for all.
                 Some messages have business specific cancelations which are covered in appropriate MTs -->
      <meta name="ipc.initialaction.flowstep.displayname">Outbound messages</meta>
      <meta name="ipc.action.allowbulking">false</meta>
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.tag.id">226</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">226</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">unlike</arg>
            <arg name="attribute.value">*92</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">unlike</arg>
            <arg name="attribute.value">*95</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">unlike</arg>
            <arg name="attribute.value">*96</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">a:&lt;&gt;</arg>
            <arg name="attribute.value">200</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">a:&lt;&gt;</arg>
            <arg name="attribute.value">201</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">a:&lt;&gt;</arg>
            <arg name="attribute.value">534</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
            <arg name="attribute.name">attribute.messageType</arg>
            <arg name="comparisonOperator">unlike</arg>
            <arg name="attribute.value">7*</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Reply" step="8">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">A n92 cancellation msg was created by {callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
              <arg name="ipc.serviceRequest.requestType">replyn92</arg>
              <arg name="ipc.serviceRequest.parameter">{callerUserName}: {comment}</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="34" name="Edit n92 Cancelation">
      <meta name="ipc.initialaction.flowstep.displayname">New n92 Cancelations</meta>
      <meta name="ipc.action.allowbulking">false</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.flowstep.id">800</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">800</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Created" status="Editing" step="3">
          <post-functions>
            <!-- Set Modifier and Modified date -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.C_ATT_2</arg>
              <arg name="attribute.value">{callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.D_ATT_2</arg>
              <arg name="attribute.value">{actionTimestamp}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Message was edited by {callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">U</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="35" name="Delete n92 Cancelation">
      <meta name="ipc.initialaction.flowstep.displayname">New n92 Cancelations</meta>
      <meta name="ipc.action.allowbulking">false</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.flowstep.id">800</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">800</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Created" status="Deleted" step="7">
          <post-functions>
            <!-- Set Modifier and Modified date -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.C_ATT_2</arg>
              <arg name="attribute.value">{callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.D_ATT_2</arg>
              <arg name="attribute.value">{actionTimestamp}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Message was deleted by {callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">G</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="36" name="Edit n95/n96 Reply">
      <meta name="ipc.initialaction.flowstep.displayname">New n95/n96 Replies</meta>
      <meta name="ipc.action.allowbulking">false</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.flowstep.id">801</meta>
      <!-- Role=Reply Creation -->
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">801</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Created" status="Editing" step="3">
          <post-functions>
            <!-- Set Modifier and Modified date -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.C_ATT_2</arg>
              <arg name="attribute.value">{callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.D_ATT_2</arg>
              <arg name="attribute.value">{actionTimestamp}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Message was edited by {callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">U</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="37" name="Delete n95/n96 Reply">
      <meta name="ipc.initialaction.flowstep.displayname">New n95/n96 Replies</meta>
      <meta name="ipc.action.allowbulking">false</meta>
      <!-- This action may not be called from BULK Menu -->
      <meta name="ipc.messageprofile.display.roleId">100</meta>
      <meta name="ipc.message.flowstep.id">801</meta>
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <arg name="roleId">100</arg>
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">801</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Created" status="Deleted" step="7">
          <post-functions>
            <!-- Set Modifier and Modified date -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.C_ATT_2</arg>
              <arg name="attribute.value">{callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.D_ATT_2</arg>
              <arg name="attribute.value">{actionTimestamp}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Message was deleted by {callerUserName}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">U</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <global-actions>
    <action id="60" name="delete message">
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.PermissionCondition</arg>
            <arg name="permission">Message.DeleteMessage</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Deleted" step="10">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">active</arg>
              <arg name="attribute.value">false</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+edited,+DELETED</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">A</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Deleted message</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="61" name="end workflow">
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.PermissionCondition</arg>
            <arg name="permission">Message.TerminateWorkflow</arg>
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="Terminated" step="-1">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Terminating workflow</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
  </global-actions>
  <steps>
    <step id="1" name="creation">
      <meta name="ipc.message.flowstep.id">103</meta>
      <actions>
        <action id="101" name="to authorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageSchemaValidCondition</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Authorisation" step="5">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">propertySet.setAsActualType("inc.last_editor.userId", transientVars.get
                                        ("callerUserId")); System.out.println("Last editor of message: " + propertySet.getLong
                                        ("inc.last_editor.userId"));</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="edit">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Editing" step="3">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">U</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+edited</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="103" name="delete">
          <restrict-to>
            <conditions type="OR">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">101</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Deleted" step="7">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">active</arg>
                  <arg name="attribute.value">false</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+edited,+DELETED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">A</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">Message deleted</arg>
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
    <step id="3" name="editing">
      <meta name="ipc.message.flowstep.id">105</meta>
      <meta name="ipc.message.editable">true</meta>
      <actions>
        <action id="301" name="save">
          <restrict-to>
            <conditions type="AND">
              <condition type="beanshell">
                <arg name="script"> String sendersMessageReferenceUC = transientVars.get("sendersMessageReference"); if
                                    (sendersMessageReferenceUC != null) { sendersMessageReferenceUC =
                                    sendersMessageReferenceUC.toUpperCase(); propertySet.setAsActualType("sendersMessageReferenceUC",
                                    sendersMessageReferenceUC); } String messageUserReferenceUC = transientVars.get("messageUserReference");
                                    if (messageUserReferenceUC != null) { messageUserReferenceUC = messageUserReferenceUC.toUpperCase();
                                    propertySet.setAsActualType("messageUserReferenceUC", messageUserReferenceUC); } String
                                    logicalTerminalAddressUC = transientVars.get("logicalTerminalAddress"); if (logicalTerminalAddressUC !=
                                    null) { logicalTerminalAddressUC = logicalTerminalAddressUC.toUpperCase();
                                    propertySet.setAsActualType("logicalTerminalAddressUC", logicalTerminalAddressUC); } String
                                    destinationAddressUC = transientVars.get("destinationAddress"); if (destinationAddressUC != null) {
                                    destinationAddressUC = destinationAddressUC.toUpperCase();
                                    propertySet.setAsActualType("destinationAddressUC", destinationAddressUC); } return true; </arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.VisibilityCondition</arg>
                <arg name="visibility">G</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Creation" step="1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_1</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_1</arg>
                  <arg name="attribute.value">{callerUserName}/{callerUserProfileId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">serviceFormatId</arg>
                  <arg name="attribute.value">100</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+EDITED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference1</arg>
                  <arg name="attribute.value">{sendersMessageReferenceUC}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference2</arg>
                  <arg name="attribute.value">{messageUserReferenceUC}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.sender</arg>
                  <arg name="attribute.value">{logicalTerminalAddressUC}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.receiver</arg>
                  <arg name="attribute.value">{destinationAddressUC}</arg>
                </function>
                <!-- Call diff service request. This stores the unedited value and the new allowing for a DIFF to be made -->
                <!-- Disabled for now as not yet completed
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">ca_CheckDiff</arg>
                                    <arg name="ipc.serviceRequest.serviceName">{DiffCheckRequired}</arg>
                                    <arg name="ipc.serviceRequest.parameter">{
                                      messageInstance.xmlSourceMessage
                                    }</arg>
                                </function>-->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script"> Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid); </arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="302" name="cancel">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Creation" step="1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
                </function>
                <!-- Set Property with curret Tag in Removal format so this
                can be removed when a user chooses to "Take" the current message -->
                <function type="beanshell">
                  <arg name="script">propertySet.setAsActualType("OriginalInitialActionRemoveTag", "-{OriginalInitialActionTag}"); </arg>
                </function>
                <!-- Reset previously removed Tag. This ensures the message
                is visible again in the expected initial Actions if processing is cancelled -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">{OriginalInitialActionTag}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="5" name="authorisation">
      <meta name="ipc.message.flowstep.id">106</meta>
      <actions>
        <action id="501" name="authorise">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">101</arg>
              </condition>
              <!-- authorizer must not be editor -->
              <condition type="beanshell">
                <arg name="script"> Long lastEditor = propertySet.getAsActualType("inc.last_editor.userId"); Long caller =
                                    transientVars.get("callerUserId"); return lastEditor == null || !lastEditor.equals(caller); </arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Authorised" step="6">
              <post-functions>
                <function type="beanshell">
                  <arg name="script"> propertySet.setAsActualType("inc.last_authorizer.userId",
                                        transientVars.get("callerUserId")); </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}/{callerUserProfileId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">A</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">SendToSAG</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="502" name="self authorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">102</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Gesendet" step="6">
              <post-functions>
                <function type="beanshell">
                  <arg name="script"> propertySet.setAsActualType("inc.last_authorizer.userId",
                                        transientVars.get("callerUserId")); </arg>
                </function>
                <function type="beanshell">
                  <arg name="script"> propertySet.setAsActualType("last_authorizer_userId",
                                        transientVars.get("callerUserId")); </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}/{callerUserProfileId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">A</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">SendToSAG</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="504" name="to correction" view="EnterOptionalComment">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">101</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Correction" step="1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">{comment}</arg>
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
    <step id="6" name="sent">
      <meta name="ipc.message.flowstep.id">107</meta>
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="601" name="TerminateWorkflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="Sent" step="-1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+EDITED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">Automatically terminating workflow</arg>
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
    <step id="7" name="deleted">
      <meta name="ipc.message.flowstep.id">108</meta>
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="701" name="TerminateWorkflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="deleted" step="-1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+EDITED,+DELETED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.NavigationFunction</arg>
                  <arg name="view">messageProfile</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="8" name="n9x created">
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="801" name="TerminateWorkflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="Erstellt" step="-1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="9" name="inbound error">
      <meta name="ipc.message.flowstep.id">101</meta>
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="901" name="release">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Gesendet" step="6">
              <post-functions>
                <function type="beanshell">
                  <arg name="script"> propertySet.setAsActualType("inc.last_authorizer.userId",
                                        transientVars.get("callerUserId")); </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}/{callerUserProfileId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+EDITED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">A</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">process_routing_in</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
      <!--  <action id="902" name="delete">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">100</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Deleted" step="7">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">active</arg>
                  <arg name="attribute.value">false</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">A</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+edited,+DELETED</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">Message deleted</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action> -->
      </actions>
    </step>
    <step id="10" name="Resolved">
      <meta name="ipc.message.flowstep.id">300</meta>
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="1001" name="TerminateWorkflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="Released" step="-1">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.TerminateWorkflowFunction</arg>
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
</workflow>`;

export { xmlSimple };
export { xmlLong };
