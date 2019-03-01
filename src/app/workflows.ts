export const xmlFirnza: string = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE workflow PUBLIC "-//OpenSymphony Group//DTD OSWorkflow 2.8//EN" "http://www.opensymphony.com/osworkflow/workflow_2_8.dtd">
<workflow>
    <initial-actions>
        <!-- Initial Action 1 is a special action that always launches the MT selection screen -->
        <action id="1" name="Create New Message">
            <restrict-to>
                <conditions type="AND">
                    <condition type="class">
                        <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                        <!-- Ensure this action is visible only for users with the role: 'wf MMFCapturer_CreateMessage' -->
                        <arg name="roleId">162</arg><!--_$ Role: wf MMFCapturer_CreateMessage $_-->
                    </condition>
                </conditions>
            </restrict-to>
            <results>
                <unconditional-result old-status="Finished" status="NewMessageCreated" step="1">
                    <post-functions>
                        <!-- Mandatory function: initializes a new message instance in IPC -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageFunction</arg>
                        </function>
                        <!-- Set the Service Format -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                            <arg name="attribute.name">serviceFormatId</arg>
                            <arg name="attribute.value">100</arg><!--_$ ServiceFormat: SWIFT FIN $_-->
                        </function>
                        <!-- Test if the message XML is valid -->
                        <function type="beanshell">
                            <arg name="script">
                                Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                            </arg>
                        </function>
                        <!-- Warning TODO: Change the tag below for other stages to use the PROD BIC. -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                            <arg name="tagInfo">+FIRNZAJJ,+{messageProfileName},I</arg>
                        </function>
                        <function type="beanshell">
                            <arg name="script">
                                String receiverBIC ="{destinationAddress}";
                                String msgType="{messageInstance.messageType}";
                               if (receiverBIC.contains("TRCKCHZ")&amp;&amp;msgType.endsWith("99"))
                               {
                                   propertySet.setString("gpiTag","gpiStatusMessage");
                               }
                    </arg>
                        </function>
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                            <arg name="tagInfo">+{gpiTag}</arg>
                        </function>
                        <!-- Set the sender, 'logicalTerminalAddress' is set by the eForm logic -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                            <arg name="attribute.name">attribute.sender</arg>
                            <arg name="attribute.value">{logicalTerminalAddress}</arg>
                        </function>
                        <!-- Set the receiver, 'destinationAddress' is set by the eForm logic -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                            <arg name="attribute.name">attribute.receiver</arg>
                            <arg name="attribute.value">{destinationAddress}</arg>
                        </function>
                        <!-- Set message references, 'sendersMessageReference' and 'messageUserReference' are set by the eForm logic -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                            <arg name="attribute.name">reference1</arg>
                            <arg name="attribute.value">{sendersMessageReference}</arg>
                        </function>
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                            <arg name="attribute.name">reference2</arg>
                            <arg name="attribute.value">{messageUserReference}</arg>
                        </function>
                        <!-- Set this message to be visible by the group only -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                            <arg name="visibility">G</arg>
                        </function>
                        <!-- Add a comment to the IPC message print -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                            <arg name="ipc.messagePrint.comment">Created new message</arg>
                        </function>
                        <!-- Save all of the above changes to the message instance -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                        </function>
                        <!-- Trigger a Service REquest to build a FIN proprietary message from the Incentage XML FIN format -->
                        <function type="class">
                            <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                            <arg name="ipc.serviceRequest.requestType">proprietary_message</arg>
                        </function>
                    </post-functions>
                </unconditional-result>
            </results>
        </action>
    </initial-actions>
    <steps>
        <!-- FOR STEP 1 USE ONLY CORRESPONDING wf MMFCapturer_SendToVerif ROLES -->
        <step id="1" name="New Messages">
            <meta name="ipc.message.flowstep.id">226</meta><!--_$ MessageFlowStep: MMF_New_Messages $_-->
            <actions>
                <action id="101" name="SendToVerification">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">167</arg><!--_$ Role: wf MMFCapturer_SendToVerif $_-->
                            </condition>
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2860</arg><!--_$ Tag: gpiStatusMessage $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageSchemaValidCondition</arg>
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToVerification" step="2">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfProcessed</arg>
                                </function>
                                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf2Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf4Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfRTGS</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf2Stage</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">check_auth_4eye</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_1</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_1</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                                    </arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="102" name="SendToCorrection">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 1 ACTION 102 USE ROLE wf MMFCapturer_SendToCorr -->
                                <arg name="roleId">166</arg><!--_$ Role: wf MMFCapturer_SendToCorr $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">G</arg>
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
                <action id="103" name="DeleteMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 1 ACTION 103 USE ROLE wf MMFCapturer_DeleteMessage -->
                                <arg name="roleId">163</arg><!--_$ Role: wf MMFCapturer_DeleteMessage $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="Deleted" step="8">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_11</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_6</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">active</arg>
                                    <arg name="attribute.value">false</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                    <arg name="ipc.messagePrint.comment">Message deleted by: {callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="104" name="SendTo1stAuthorisation">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">167</arg><!--_$ Role: wf MMFCapturer_SendToVerif $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2860</arg><!--_$ Tag: gpiStatusMessage $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">+wf2Eyes</arg>
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
            </actions>
        </step>
        <!-- FOR STEP 2 USE ONLY CORRESPONDING wf MMFVerifier_SendToAuth ROLES -->
        <step id="2" name="Verification">
            <meta name="ipc.message.flowstep.id">227</meta><!--_$ MessageFlowStep: MMF_Verification $_-->
            <actions>
                <action id="201" name="SendTo1stAuthorisation">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">170</arg><!--_$ Role: wf MMFVerifier_SendToAuth $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_1</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2371</arg><!--_$ Tag: wf2Stage $_-->
                            </condition>
                            <!-- Check to ensure that the +wfProcessed Tag is set. -->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">369</arg><!--_$ Tag: wfProcessed $_-->
                                <!-- replace this ID with the ID for the Tag = wfProcessed -->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
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
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="202" name="SendToCorrection">
                    <restrict-to>
                        <conditions type="AND">
                            <!-- FOR STEP 2 ACTION 202 USE ROLE wf MMFVerifier_SendToCorr -->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">169</arg><!--_$ Role: wf MMFVerifier_SendToCorr $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">G</arg>
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
        <!-- Allow direct release of the message by the 1Authorisor for messages that only require 2Eye authorisation-->
                <action id="203" name="ReleaseMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 4 ACTION 401 USE ROLE MMFAuthoriser_ReleaseMessage -->
                                <arg name="roleId">170</arg><!--_$ Role: wf MMFVerifier_SendToAuth $_-->
                            </condition>
                            <!-- Check to ensure that the +wf2Stage Tag is set.-->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2371</arg><!--_$ Tag: wf2Stage $_-->
                            </condition>
                            <!-- Check to ensure that the +wf4Eyes Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">368</arg><!--_$ Tag: wf4Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">370</arg><!--_$ Tag: wf2Eyes $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_1</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_2</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_3</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="MessageReleased" step="8">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_3</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_18</arg>
                                    <arg name="attribute.value">{callerUserGroupId}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_3</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
            </actions>
            <!-- End of allowing messages 399 and 999 to go straight to Second Authorisation -->
        </step>
        <!-- FOR STEP 3 USE ONLY CORRESPONDING wf MMFAuthoriser_ReleaseMsg ROLES -->
        <step id="3" name="1stAuthorisation">
            <meta name="ipc.message.flowstep.id">228</meta><!--_$ MessageFlowStep: MMF_Authorisation $_-->
            <actions>
                <action id="301" name="SendTo2ndAuthorisation">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">202</arg><!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_1</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_2</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">370</arg><!--_$ Tag: wf2Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wf4Eyes Tag is set.-->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">368</arg><!--_$ Tag: wf4Eyes $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentTo2ndAuth" step="4">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_3</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_3</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <!-- Allow direct release of the message by the 1Authorisor for messages that only require 2Eye authorisation-->
                <action id="303" name="ReleaseMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 4 ACTION 401 USE ROLE MMFAuthoriser_ReleaseMessage -->
                                <arg name="roleId">202</arg><!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
                            </condition>
                            <!-- Check to ensure that the +wf2Eyes Tag is set.-->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">370</arg><!--_$ Tag: wf2Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wf4Eyes Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">368</arg><!--_$ Tag: wf4Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wfRTGS Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">568</arg><!--_$ Tag: wfRTGS $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_1</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_2</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_3</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="MessageReleased" step="8">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_3</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_18</arg>
                                    <arg name="attribute.value">{callerUserGroupId}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_3</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="304" name="SendToCorrection">
                    <!-- FOR STEP 3 USE ONLY CORRESPONDING wf MMFAuthoriser_SendToCorr ROLES -->
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">173</arg><!--_$ Role: wf MMFAuthoriser_SendToCorr $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">G</arg>
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
            </actions>
        </step>
        <!-- FOR STEP 4 USE ONLY CORRESPONDING MMFAuthoriser ROLES (same as used in step 3)-->
        <step id="4" name="2ndAuthorisation">
            <meta name="ipc.message.flowstep.id">164</meta><!--_$ MessageFlowStep: MMF_2ndAuthorisation $_-->
            <actions>
                <action id="402" name="ReleaseMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 4 ACTION 401 USE ROLE MMFAuthoriser_ReleaseMessage -->
                                <arg name="roleId">202</arg><!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_1</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_2</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                                <arg name="attribute.name">attribute.C_ATT_3</arg>
                                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                                <arg name="attribute.value">{callerUserName}</arg>
                            </condition>
                            <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">370</arg><!--_$ Tag: wf2Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wf4Eyes Tag is set.-->
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">368</arg><!--_$ Tag: wf4Eyes $_-->
                            </condition>
                            <!-- Check to ensure that the +wfRTGS Tag is NOT set.-->
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">568</arg><!--_$ Tag: wfRTGS $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="MessageReleased" step="8">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_13</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_18</arg>
                                    <arg name="attribute.value">{callerUserGroupId}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_8</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="403" name="SendToCorrection">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 3 ACTION 302 USE ROLE wf MMFAuthoriser_SendToCorr -->
                                <arg name="roleId">173</arg><!--_$ Role: wf MMFAuthoriser_SendToCorr $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">G</arg>
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
            </actions>
        </step>
        <!-- FOR STEP 6 USE ONLY CORRESPONDING MMFCapturer ROLES -->
        <step id="6" name="Correction">
            <meta name="ipc.message.flowstep.id">229</meta><!--_$ MessageFlowStep: MMF_Correction $_-->
            <actions>
                <action id="601" name="EditMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 5 ACTION 501 USE ROLE wf MMFCapturer_EditMessage -->
                                <arg name="roleId">164</arg><!--_$ Role: wf MMFCapturer_EditMessage $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToEditing" step="7">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">U</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfProcessed</arg>
                                </function>
                                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf2Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf4Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfRTGS</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-gpiStatusMessage</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="602" name="DeleteMessage">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 5 ACTION 502 USE ROLE wf MMFCapturer_DeleteMessage -->
                                <arg name="roleId">163</arg><!--_$ Role: wf MMFCapturer_DeleteMessage $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="Deleted" step="9">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_11</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_6</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">active</arg>
                                    <arg name="attribute.value">false</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                    <arg name="ipc.messagePrint.comment">Message deleted by: {callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
                <action id="603" name="SendToVerification">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 5 ACTION 503 USE ROLE wf MMFCapturer_SendToVerif -->
                                <arg name="roleId">167</arg><!--_$ Role: wf MMFCapturer_SendToVerif $_-->
                            </condition>
                            <condition type="class" negate="true">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2860</arg><!--_$ Tag: gpiStatusMessage $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageSchemaValidCondition</arg>
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentToVerification" step="2">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_1</arg>
                                    <arg name="attribute.value">{callerUserName}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_1</arg>
                                    <arg name="attribute.value">{actionTimestamp}</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                                    </arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfProcessed</arg>
                                </function>
                                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf2Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wf4Eyes</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">-wfRTGS</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">{messageProfileName},-QnAToCorrection,-NakToCorrection</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">check_auth_4eye</arg>
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
                <action id="604" name="SendTo1stAuthorisation">
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <arg name="roleId">167</arg><!--_$ Role: wf MMFCapturer_SendToVerif $_-->
                            </condition>
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                                <arg name="tagId">2860</arg><!--_$ Tag: gpiStatusMessage $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
                            <post-functions>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">+wf2Eyes</arg>
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
            </actions>
        </step>
        <!-- FOR STEP 7 USE ONLY CORRESPONDING MMFCapturer ROLES -->
        <step id="7" name="Edit">
            <meta name="ipc.message.flowstep.id">230</meta><!--_$ MessageFlowStep: MMF_Edit $_-->
            <meta name="ipc.message.editable">true</meta>
            <actions>
                <action id="701" name="Save">
                    <meta name="ipc.action.allowbulking">false</meta>
                    <restrict-to>
                        <conditions type="AND">
                            <condition type="class">
                                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                                <!-- FOR STEP 6 ACTION 601 USE ROLE wf MMFCapturer_Save -->
                                <arg name="roleId">165</arg><!--_$ Role: wf MMFCapturer_Save $_-->
                            </condition>
                        </conditions>
                    </restrict-to>
                    <results>
                        <unconditional-result old-status="Editing" status="Saved" step="6">
                            <post-functions>
                                <!-- Reset the previous Autorisation and Verification usernames to ensure these can process this message as if it was a new one. -->
                                <!-- Reset Verification data -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_2</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_2</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <!-- Reset 1st Authorisor data -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_3</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        String receiverBIC ="{destinationAddress}";
                                        String msgType="{
                                          messageInstance.messageType
                                        }";
                                        if(receiverBIC.contains("TRCKCHZ")&amp;&amp; msgType.endsWith("99"))
                                        {
                                           propertySet.setString("gpiTag","gpiStatusMessage");
                                        } else {
                                            propertySet.setString("gpiTag","");
                                        }
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">+{gpiTag}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_3</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <!-- Reset 2nd Authorisor data -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.C_ATT_13</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.D_ATT_8</arg>
                                    <arg name="attribute.value"/>
                                </function>
                                <!-- Set new values -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.receiver</arg>
                                    <arg name="attribute.value">{destinationAddress}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">attribute.sender</arg>
                                    <arg name="attribute.value">{logicalTerminalAddress}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                                    <arg name="visibility">G</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                                </function>
                                <function type="beanshell">
                                    <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                                    <arg name="ipc.serviceRequest.requestType">proprietary_message</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">reference1</arg>
                                    <arg name="attribute.value">{sendersMessageReference}</arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">reference2</arg>
                                    <arg name="attribute.value">{messageUserReference}</arg>
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
        <!-- NO ROLES APPLICABLE -->
        <step id="8" name="Released">
            <meta name="ipc.message.flowstep.id">231</meta><!--_$ MessageFlowStep: MMF_Released $_-->
            <meta name="ipc.messageprofile.display">false</meta>
            <actions>
                <action id="801" name="Terminate Workflow" auto="true">
                    <results>
                        <unconditional-result old-status="Finished" status="Released" step="-1">
                            <post-functions>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">+WFD,-QnAToCorrection</arg>
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
        <!-- NO ROLES APPLICABLE -->
        <step id="9" name="Deleted">
            <meta name="ipc.message.flowstep.id">232</meta><!--_$ MessageFlowStep: MMF_Deleted $_-->
            <meta name="ipc.messageprofile.display">false</meta>
            <actions>
                <action id="901" name="Terminate Workflow" auto="true">
                    <results>
                        <unconditional-result old-status="Finished" status="Deleted" step="-1">
                            <post-functions>
                                <function type="beanshell">
                                    <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                                    </arg>
                                </function>
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                                    <arg name="tagInfo">+WFD</arg>
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
                                <!-- complete message by setting attribute "active" to false -->
                                <function type="class">
                                    <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                                    <arg name="attribute.name">active</arg>
                                    <arg name="attribute.value">false</arg>
                                </function>
                            </post-functions>
                        </unconditional-result>
                    </results>
                </action>
            </actions>
        </step>
    </steps>
</workflow>
`;

export const xmlFnb: string = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE workflow PUBLIC "-//OpenSymphony Group//DTD OSWorkflow 2.8//EN" "http://www.opensymphony.com/osworkflow/workflow_2_8.dtd">
<workflow>
  <initial-actions>
    <!-- Initial Action 1 is a special action that always launches the MT selection screen -->
    <action id="1" name="Create New Message">
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
            <!-- Ensure this action is visible only for users with the role: 'wf MMFCapturer_CreateMessage' -->
            <arg name="roleId">162</arg>            <!--_$ Role: wf MMFCapturer_CreateMessage $_-->
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="NewMessageCreated" step="1">
          <post-functions>
            <!-- Mandatory function: initializes a new message instance in IPC -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageFunction</arg>
            </function>
            <!-- Set the Service Format -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">serviceFormatId</arg>
              <arg name="attribute.value">100</arg>              <!--_$ ServiceFormat: SWIFT FIN $_-->
            </function>
            <!-- Test if the message XML is valid -->
            <function type="beanshell">
              <arg name="script">
                                Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
              </arg>
            </function>
            <!-- Set tags based on the Sender BIC8 -->
            <function type="beanshell">
              <arg name="script">
                                String lta = new String("{logicalTerminalAddress}");
                                propertySet.setString("bic8Address", lta.substring(0, 8));
              </arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+{bic8Address}</arg>
            </function>
            <!-- Set a tag to indicate that this is a GPI message -->
            <function type="beanshell">
              <arg name="script">
                                String da ="{destinationAddress}";
                                String mt="{messageInstance.messageType}";
                                if (da.contains("TRCKCHZ") &amp;&amp; mt.endsWith("99"))
                                {
                                    propertySet.setString("gpiTag","gpiStatusMessage");
                                } else {
                                    propertySet.setString("gpiTag","");
                                }
              </arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+{gpiTag}</arg>
            </function>
            <!-- Set tags based on the current Message Profile -->
            <function type="beanshell">
              <arg name="script">
                                String mpn = new String("{messageProfileName}");
                                propertySet.setString("messageProfileRoot", mpn.substring(0, mpn.length() - 4));
              </arg>
            </function>
            <!-- Set a tag to indicate that this is an outgoing message for this division -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
              <arg name="tagInfo">+{messageProfileRoot}_OUT</arg>
            </function>
            <!-- Set the sender, 'logicalTerminalAddress' is set by the eForm logic -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.sender</arg>
              <arg name="attribute.value">{logicalTerminalAddress}</arg>
            </function>
            <!-- Set the receiver, 'destinationAddress' is set by the eForm logic -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">attribute.receiver</arg>
              <arg name="attribute.value">{destinationAddress}</arg>
            </function>
            <!-- Set message references, 'sendersMessageReference' and 'messageUserReference' are set by the eForm logic -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">reference1</arg>
              <arg name="attribute.value">{sendersMessageReference}</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
              <arg name="attribute.name">reference2</arg>
              <arg name="attribute.value">{messageUserReference}</arg>
            </function>
            <!-- Set this message to be visible by the group only -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
              <arg name="visibility">G</arg>
            </function>
            <!-- Add a comment to the IPC message print -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
              <arg name="ipc.messagePrint.comment">Created new message</arg>
            </function>
            <!-- Save all of the above changes to the message instance -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
            <!-- Trigger a Service REquest to build a FIN proprietary message from the Incentage XML FIN format -->
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
              <arg name="ipc.serviceRequest.requestType">proprietary_message</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
    <action id="12" name="NakToCorrection">
      <meta name="ipc.message.action.type">auto</meta>
      <meta name="ipc.message.flowstep.id">244</meta>      <!--_$ MessageFlowStep: wf_NakToCorrection $_-->
      <restrict-to>
        <conditions type="AND">
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageFlowStepCondition</arg>
            <arg name="flowStepId">244</arg>            <!--_$ MessageFlowStep: wf_NakToCorrection $_-->
          </condition>
          <condition type="class">
            <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
            <arg name="tagId">1106</arg>            <!--_$ Tag: NakToCorrection $_-->
          </condition>
        </conditions>
      </restrict-to>
      <results>
        <unconditional-result old-status="Finished" status="NakToCorrection" step="6">
          <post-functions>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.StartWorkflowFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
            </function>
            <function type="class">
              <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
            </function>
          </post-functions>
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <steps>
    <!-- FOR STEP 1 USE ONLY CORRESPONDING wf MMFCapturer_SendToVerif ROLES -->
    <step id="1" name="New Messages">
      <meta name="ipc.message.flowstep.id">226</meta>      <!--_$ MessageFlowStep: MMF_New_Messages $_-->
      <actions>
        <action id="101" name="SendToVerification">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">167</arg>                <!--_$ Role: wf MMFCapturer_SendToVerif $_-->
              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">2860</arg>                <!--_$ Tag: gpiStatusMessage $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageSchemaValidCondition</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToVerification" step="2">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfProcessed</arg>
                </function>
                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf2Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf4Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfRTGS</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">check_auth_4eye</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_1</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_1</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                  </arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="SendToCorrection">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 1 ACTION 102 USE ROLE wf MMFCapturer_SendToCorr -->
                <arg name="roleId">166</arg>                <!--_$ Role: wf MMFCapturer_SendToCorr $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
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
        <action id="103" name="DeleteMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 1 ACTION 103 USE ROLE wf MMFCapturer_DeleteMessage -->
                <arg name="roleId">163</arg>                <!--_$ Role: wf MMFCapturer_DeleteMessage $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Deleted" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_11</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_6</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">active</arg>
                  <arg name="attribute.value">false</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">Message deleted by: {callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="104" name="SendTo1stAuthorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">167</arg>                <!--_$ Role: wf MMFCapturer_SendToVerif $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">2860</arg>                <!--_$ Tag: gpiStatusMessage $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+wf2Eyes</arg>
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
      </actions>
    </step>
    <!-- FOR STEP 2 USE ONLY CORRESPONDING wf MMFVerifier_SendToAuth ROLES -->
    <step id="2" name="Verification">
      <meta name="ipc.message.flowstep.id">227</meta>      <!--_$ MessageFlowStep: MMF_Verification $_-->
      <actions>
        <action id="201" name="SendTo1stAuthorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">170</arg>                <!--_$ Role: wf MMFVerifier_SendToAuth $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <!-- Check to ensure that the +wfProcessed Tag is set. -->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">369</arg>                <!--_$ Tag: wfProcessed $_-->
                <!-- replace this ID with the ID for the Tag = wfProcessed -->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
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
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="202" name="SendToCorrection">
          <restrict-to>
            <conditions type="AND">
              <!-- FOR STEP 2 ACTION 202 USE ROLE wf MMFVerifier_SendToCorr -->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">169</arg>                <!--_$ Role: wf MMFVerifier_SendToCorr $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
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
      </actions>
      <!-- End of allowing messages 399 and 999 to go straight to Second Authorisation -->
    </step>
    <!-- FOR STEP 3 USE ONLY CORRESPONDING wf MMFAuthoriser_ReleaseMsg ROLES -->
    <step id="3" name="1stAuthorisation">
      <meta name="ipc.message.flowstep.id">228</meta>      <!--_$ MessageFlowStep: MMF_Authorisation $_-->
      <actions>
        <action id="301" name="SendTo2ndAuthorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">202</arg>                <!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wf4Eyes Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentTo2ndAuth" step="4">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="302" name="SendToTreasury">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">284</arg>                <!--_$ Role: wf MMFAuthoriser_SendToTrea $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <!-- Check to ensure that the +wf2Eyes Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wf4Eyes Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wfRTGS Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">568</arg>                <!--_$ Tag: wfRTGS $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToTreasury" step="5">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <!-- Allow direct release of the message by the 1Authorisor for messages that only require 2Eye authorisation-->
        <action id="303" name="ReleaseMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 4 ACTION 401 USE ROLE MMFAuthoriser_ReleaseMessage -->
                <arg name="roleId">202</arg>                <!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
              </condition>
              <!-- Check to ensure that the +wf2Eyes Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wf4Eyes Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wfRTGS Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">568</arg>                <!--_$ Tag: wfRTGS $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_3</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="MessageReleased" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_18</arg>
                  <arg name="attribute.value">{callerUserGroupId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="304" name="SendToCorrection">
          <!-- FOR STEP 3 USE ONLY CORRESPONDING wf MMFAuthoriser_SendToCorr ROLES -->
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">173</arg>                <!--_$ Role: wf MMFAuthoriser_SendToCorr $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
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
      </actions>
    </step>
    <!-- FOR STEP 4 USE ONLY CORRESPONDING MMFAuthoriser ROLES (same as used in step 3)-->
    <step id="4" name="2ndAuthorisation">
      <meta name="ipc.message.flowstep.id">164</meta>      <!--_$ MessageFlowStep: MMF_2ndAuthorisation $_-->
      <actions>
        <action id="401" name="SendToTreasury">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">284</arg>                <!--_$ Role: wf MMFAuthoriser_SendToTrea $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_3</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wf4Eyes Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wfRTGS Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">568</arg>                <!--_$ Tag: wfRTGS $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToTreasury" step="5">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_13</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_8</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="402" name="ReleaseMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 4 ACTION 401 USE ROLE MMFAuthoriser_ReleaseMessage -->
                <arg name="roleId">202</arg>                <!--_$ Role: wf MMFAuthoriser_ReleaseMsg $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_3</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <!-- Check to ensure that the +wf2Eyes Tag is NOT set.-->
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <!-- Check to ensure that the +wf4Eyes Tag is set.-->
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
                <!-- Check to ensure that the +wfRTGS Tag is NOT set.-->
                </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">568</arg>                <!--_$ Tag: wfRTGS $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="MessageReleased" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_13</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_18</arg>
                  <arg name="attribute.value">{callerUserGroupId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_8</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="403" name="SendToCorrection">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 3 ACTION 302 USE ROLE wf MMFAuthoriser_SendToCorr -->
                <arg name="roleId">173</arg>                <!--_$ Role: wf MMFAuthoriser_SendToCorr $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
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
      </actions>
    </step>
    <!-- FOR STEP 5 USE ONLY CORRESPONDING wf MMFTreasurer_Release ROLES-->
    <step id="5" name="Treasurer">
      <meta name="ipc.message.flowstep.id">204</meta>      <!--_$ MessageFlowStep: MMF_Treasurer $_-->
      <actions>
        <action id="501" name="ReleaseMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 501 USE ROLE MMFTreasurer_ReleaseMsg  -->
                <arg name="roleId">225</arg>                <!--_$ Role: wf MMFTreasurer_ReleaseMsg $_-->
              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_3</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_13</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="MessageReleased" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_14</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_18</arg>
                  <arg name="attribute.value">{callerUserGroupId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_9</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="502" name="Release_2eyes_Message">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 501 USE ROLE MMFTreasurer_ReleaseMsg  -->
                <arg name="roleId">225</arg>                <!--_$ Role: wf MMFTreasurer_ReleaseMsg $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->

              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_3</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="MessageReleased" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_14</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_9</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_18</arg>
                  <arg name="attribute.value">{callerUserGroupId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="503" name="Release_4eyes_Message">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 501 USE ROLE MMFTreasurer_ReleaseMsg  -->
                <arg name="roleId">225</arg>                <!--_$ Role: wf MMFTreasurer_ReleaseMsg $_-->
              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">370</arg>                <!--_$ Tag: wf2Eyes $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">368</arg>                <!--_$ Tag: wf4Eyes $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_1</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_2</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageAttributeValueCondition</arg>
                <arg name="attribute.name">attribute.C_ATT_13</arg>
                <arg name="comparisonOperator">a:&lt;&gt;</arg>
                <arg name="attribute.value">{callerUserName}</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="MessageReleased" step="8">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_14</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_9</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_18</arg>
                  <arg name="attribute.value">{callerUserGroupId}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">create_fin_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="504" name="SendToCorrection">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 3 ACTION 302 USE ROLE wf MMFTreasurer_SendToCorr -->
                <arg name="roleId">226</arg>                <!--_$ Role: wf MMFTreasurer_SendToCorr $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToCorrection" step="6">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
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
      </actions>
    </step>
    <!-- FOR STEP 6 USE ONLY CORRESPONDING MMFCapturer ROLES -->
    <step id="6" name="Correction">
      <meta name="ipc.message.flowstep.id">229</meta>      <!--_$ MessageFlowStep: MMF_Correction $_-->
      <actions>
        <action id="601" name="EditMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 501 USE ROLE wf MMFCapturer_EditMessage -->
                <arg name="roleId">164</arg>                <!--_$ Role: wf MMFCapturer_EditMessage $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToEditing" step="7">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">U</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfProcessed</arg>
                </function>
                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf2Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf4Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfRTGS</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-gpiStatusMessage</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">proprietary_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference1</arg>
                  <arg name="attribute.value">{sendersMessageReference}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference2</arg>
                  <arg name="attribute.value">{messageUserReference}</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="602" name="DeleteMessage">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 502 USE ROLE wf MMFCapturer_DeleteMessage -->
                <arg name="roleId">163</arg>                <!--_$ Role: wf MMFCapturer_DeleteMessage $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="Deleted" step="9">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_11</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_6</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">active</arg>
                  <arg name="attribute.value">false</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                  <arg name="ipc.messagePrint.comment">Message deleted by: {callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.AccountMessageChangeFunction</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
        <action id="603" name="SendToVerification">
          <meta name="ipc.action.allowbulking">false</meta>
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 5 ACTION 503 USE ROLE wf MMFCapturer_SendToVerif -->
                <arg name="roleId">167</arg>                <!--_$ Role: wf MMFCapturer_SendToVerif $_-->
              </condition>
              <condition type="class" negate="true">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">2860</arg>                <!--_$ Tag: gpiStatusMessage $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageSchemaValidCondition</arg>
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentToVerification" step="2">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_1</arg>
                  <arg name="attribute.value">{callerUserName}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_1</arg>
                  <arg name="attribute.value">{actionTimestamp}</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                  </arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <!-- Remove the wfProcessed tag to block processing of this message until it has been processed via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfProcessed</arg>
                </function>
                <!-- Remove the 2Eyes, 4Eyes and RTGS tag to block as these need to be reset via service request component. -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf2Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wf4Eyes</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">-wfRTGS</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">check_auth_4eye</arg>
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
        <action id="604" name="SendTo1stAuthorisation">
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <arg name="roleId">167</arg>                <!--_$ Role: wf MMFCapturer_SendToVerif $_-->
              </condition>
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.MessageTagCondition</arg>
                <arg name="tagId">2860</arg>                <!--_$ Tag: gpiStatusMessage $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Finished" status="SentTo1stAuth" step="3">
              <post-functions>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+wf2Eyes</arg>
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
      </actions>
    </step>
    <!-- FOR STEP 7 USE ONLY CORRESPONDING MMFCapturer ROLES -->
    <step id="7" name="Edit">
      <meta name="ipc.message.flowstep.id">230</meta>      <!--_$ MessageFlowStep: MMF_Edit $_-->
      <meta name="ipc.message.editable">true</meta>
      <actions>
        <action id="701" name="Save">
          <meta name="ipc.action.allowbulking">false</meta>
          <restrict-to>
            <conditions type="AND">
              <condition type="class">
                <arg name="class.name">com.incentage.ipc.workflow.condition.UserIsInRoleCondition</arg>
                <!-- FOR STEP 6 ACTION 601 USE ROLE wf MMFCapturer_Save -->
                <arg name="roleId">165</arg>                <!--_$ Role: wf MMFCapturer_Save $_-->
              </condition>
            </conditions>
          </restrict-to>
          <results>
            <unconditional-result old-status="Editing" status="Saved" step="6">
              <post-functions>
                <!-- Reset the previous Autorisation and Verification usernames to ensure these can process this message as if it was a new one. -->
                <!-- Reset Verification data -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_2</arg>
                  <arg name="attribute.value"/>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_2</arg>
                  <arg name="attribute.value"/>
                </function>
                <!-- Reset 1st Authorisor data -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_3</arg>
                  <arg name="attribute.value"/>
                </function>
                <!-- Set a tag to indicate that this is a GPI message -->
                <function type="beanshell">
                  <arg name="script">
                                        String da ="{destinationAddress}";
                                        String mt="{
                                          messageInstance.messageType
                                        }";
                                        if (da.contains("TRCKCHZ") &amp;&amp; mt.endsWith("99"))
                                        {
                                            propertySet.setString("gpiTag","gpiStatusMessage");
                                        } else {
                                            propertySet.setString("gpiTag","");
                                        }
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeMessageTagsFunction</arg>
                  <arg name="tagInfo">+{gpiTag}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_3</arg>
                  <arg name="attribute.value"/>
                </function>
                <!-- Reset 2nd Authorisor data -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.C_ATT_13</arg>
                  <arg name="attribute.value"/>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.D_ATT_8</arg>
                  <arg name="attribute.value"/>
                </function>
                <!-- Set new values -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageFlowStepFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.receiver</arg>
                  <arg name="attribute.value">{destinationAddress}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">attribute.sender</arg>
                  <arg name="attribute.value">{logicalTerminalAddress}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.ChangeVisibility</arg>
                  <arg name="visibility">G</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateSourceMessageFunction</arg>
                </function>
                <function type="beanshell">
                  <arg name="script">
                                        Boolean schemaValid = transientVars.get("xmlSourceMessageSchemaValid");
                                        propertySet.setAsActualType("xmlSourceMessageSchemaValid", schemaValid);
                  </arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.GenerateWorkflowHistoryFunction</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.CreateMessageServiceRequestFunction</arg>
                  <arg name="ipc.serviceRequest.requestType">proprietary_message</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference1</arg>
                  <arg name="attribute.value">{sendersMessageReference}</arg>
                </function>
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">reference2</arg>
                  <arg name="attribute.value">{messageUserReference}</arg>
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
    <!-- NO ROLES APPLICABLE -->
    <step id="8" name="Released">
      <meta name="ipc.message.flowstep.id">231</meta>      <!--_$ MessageFlowStep: MMF_Released $_-->
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="801" name="Terminate Workflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="Released" step="-1">
              <post-functions>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
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
    <!-- NO ROLES APPLICABLE -->
    <step id="9" name="Deleted">
      <meta name="ipc.message.flowstep.id">232</meta>      <!--_$ MessageFlowStep: MMF_Deleted $_-->
      <meta name="ipc.messageprofile.display">false</meta>
      <actions>
        <action id="901" name="Terminate Workflow" auto="true">
          <results>
            <unconditional-result old-status="Finished" status="Deleted" step="-1">
              <post-functions>
                <function type="beanshell">
                  <arg name="script">
                                        propertySet.setAsActualType("inc.last_editor.userId", transientVars.get("callerUserId"));
                                        System.out.println("Last editor of message: " + propertySet.getLong("inc.last_editor.userId"));
                  </arg>
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
                <!-- complete message by setting attribute "active" to false -->
                <function type="class">
                  <arg name="class.name">com.incentage.ipc.workflow.function.UpdateMessageAttributeFunction</arg>
                  <arg name="attribute.name">active</arg>
                  <arg name="attribute.value">false</arg>
                </function>
              </post-functions>
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
  </steps>
</workflow>`;

export const xmlSimple: string = `<?xml version="1.0" encoding="utf-8"?>
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

export const xmlLong: string = `<?xml version="1.0" encoding="utf-8"?>
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
