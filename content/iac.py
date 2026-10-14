"""CDK and CloudFormation snippets keyed by track. Study copies, not a deployed stack."""

DOC_INSTANCE = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-instance.html"
DOC_CDK_INSTANCE = "https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_connect.CfnInstance.html"
DOC_FLOW = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-contactflow.html"
DOC_FLOW_LANG = "https://docs.aws.amazon.com/connect/latest/devguide/flow-language-example.html"
DOC_PHONE = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-phonenumber.html"
DOC_HOURS = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-hoursofoperation.html"
DOC_QUEUE = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-queue.html"
DOC_PROFILE = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-routingprofile.html"
DOC_INTEGRATION = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-integrationassociation.html"
DOC_STORAGE = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-instancestorageconfig.html"
DOC_ORIGIN = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-approvedorigin.html"
DOC_TDG = "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-connect-trafficdistributiongroup.html"
DOC_LAMBDA_PERM = "https://docs.aws.amazon.com/connect/latest/adminguide/connect-lambda-functions.html"
DOC_LEX = "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-lex.html"

IAC = {
    "foundations": {
        "title": "Instance the contact center sits on",
        "blurb": "IAM, Lambda, S3, Kinesis, and CloudWatch are not inside the instance. This stack creates the instance and turns on flow logs and Contact Lens.",
        "urls": [("CfnInstance", DOC_CDK_INSTANCE), ("AWS::Connect::Instance", DOC_INSTANCE)],
        "cfn": """AWSTemplateFormatVersion: "2010-09-09"
Description: Connect instance with flow logs and Contact Lens
Resources:
  CampusInstance:
    Type: AWS::Connect::Instance
    Properties:
      IdentityManagementType: SAML
      InstanceAlias: campus-demo
      Attributes:
        InboundCalls: true
        OutboundCalls: true
        ContactflowLogs: true
        ContactLens: true
""",
        "cdk": """import * as connect from "aws-cdk-lib/aws-connect";

new connect.CfnInstance(this, "CampusInstance", {
  identityManagementType: "SAML",
  instanceAlias: "campus-demo",
  attributes: {
    inboundCalls: true,
    outboundCalls: true,
    contactflowLogs: true,
    contactLens: true,
  },
});
""",
    },
    "instance": {
        "title": "AWS::Connect::Instance",
        "blurb": "One instance, one Region. IdentityManagementType is SAML or CONNECT_MANAGED. The alias becomes the instance name.",
        "urls": [("CfnInstance", DOC_CDK_INSTANCE), ("AWS::Connect::Instance", DOC_INSTANCE)],
        "cfn": """Resources:
  CampusInstance:
    Type: AWS::Connect::Instance
    Properties:
      IdentityManagementType: CONNECT_MANAGED
      InstanceAlias: campus-demo
      Attributes:
        InboundCalls: true
        OutboundCalls: true
        ContactflowLogs: true
""",
        "cdk": """new connect.CfnInstance(this, "CampusInstance", {
  identityManagementType: "CONNECT_MANAGED",
  instanceAlias: "campus-demo",
  attributes: { inboundCalls: true, outboundCalls: true, contactflowLogs: true },
});
""",
    },
    "telephony": {
        "title": "Claim a phone number",
        "blurb": "AWS::Connect::PhoneNumber claims a DID or toll-free number into the instance. The first claim can still fail a service quota even when the template is valid.",
        "urls": [("AWS::Connect::PhoneNumber", DOC_PHONE)],
        "cfn": """Resources:
  PilotDid:
    Type: AWS::Connect::PhoneNumber
    Properties:
      TargetArn: !GetAtt CampusInstance.Arn
      CountryCode: US
      Type: DID
      Prefix: "+1503"
""",
        "cdk": """new connect.CfnPhoneNumber(this, "PilotDid", {
  targetArn: instance.attrArn,
  countryCode: "US",
  type: "DID",
  prefix: "+1503",
});
""",
    },
    "flows": {
        "title": "Contact flow from flow-language JSON",
        "blurb": "AWS::Connect::ContactFlow stores the flow-language document in Content. Type CONTACT_FLOW is the inbound flow. Build the JSON in the flow lab, then paste it here.",
        "urls": [("AWS::Connect::ContactFlow", DOC_FLOW), ("Flow language", DOC_FLOW_LANG)],
        "cfn": """Resources:
  OrderStatus:
    Type: AWS::Connect::ContactFlow
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: OrderStatus
      Type: CONTACT_FLOW
      Content: '{"Version":"2019-10-30","StartAction":"a1","Actions":[{"Identifier":"a1","Type":"MessageParticipant","Parameters":{"Text":"Thanks for calling."},"Transitions":{"NextAction":"a2","Errors":[],"Conditions":[]}},{"Identifier":"a2","Type":"DisconnectParticipant","Parameters":{},"Transitions":{}}]}'
""",
        "cdk": """new connect.CfnContactFlow(this, "OrderStatus", {
  instanceArn: instance.attrArn,
  name: "OrderStatus",
  type: "CONTACT_FLOW",
  content: JSON.stringify({
    Version: "2019-10-30",
    StartAction: "a1",
    Actions: [
      {
        Identifier: "a1",
        Type: "MessageParticipant",
        Parameters: { Text: "Thanks for calling." },
        Transitions: { NextAction: "a2", Errors: [], Conditions: [] },
      },
      { Identifier: "a2", Type: "DisconnectParticipant", Parameters: {}, Transitions: {} },
    ],
  }),
});
""",
    },
    "lex": {
        "title": "Associate a Lex V2 bot alias",
        "blurb": "The bot must be associated with the instance before Get customer input can select it. IntegrationType is LEX_BOT and IntegrationArn is the alias ARN.",
        "urls": [("IntegrationAssociation", DOC_INTEGRATION), ("Lex in Connect", DOC_LEX)],
        "cfn": """Resources:
  LexAlias:
    Type: AWS::Connect::IntegrationAssociation
    Properties:
      InstanceId: !GetAtt CampusInstance.Id
      IntegrationType: LEX_BOT
      IntegrationArn: arn:aws:lex:us-west-2:123456789012:bot-alias/BOTID/ALIASID
""",
        "cdk": """new connect.CfnIntegrationAssociation(this, "LexAlias", {
  instanceId: instance.attrId,
  integrationType: "LEX_BOT",
  integrationArn: "arn:aws:lex:us-west-2:123456789012:bot-alias/BOTID/ALIASID",
});
""",
    },
    "ai": {
        "title": "Turn on Contact Lens with the instance",
        "blurb": "Agent assist still uses the wisdom IAM prefix. The instance attribute ContactLens is the switch this campus can show in a template. The assistant domain is associated after the instance exists.",
        "urls": [("CfnInstance", DOC_CDK_INSTANCE), ("AWS::Connect::Instance", DOC_INSTANCE)],
        "cfn": """Resources:
  CampusInstance:
    Type: AWS::Connect::Instance
    Properties:
      IdentityManagementType: SAML
      InstanceAlias: campus-demo
      Attributes:
        InboundCalls: true
        OutboundCalls: true
        ContactflowLogs: true
        ContactLens: true
""",
        "cdk": """new connect.CfnInstance(this, "CampusInstance", {
  identityManagementType: "SAML",
  instanceAlias: "campus-demo",
  attributes: {
    inboundCalls: true,
    outboundCalls: true,
    contactflowLogs: true,
    contactLens: true,
  },
});
""",
    },
    "lambda": {
        "title": "Allow Connect to invoke the function",
        "blurb": "Two pieces: a resource policy that trusts connect.amazonaws.com, and an integration association so the flow can select the function. The block still waits at most 8 seconds when InvocationType is SYNCHRONOUS.",
        "urls": [("Lambda functions", DOC_LAMBDA_PERM), ("IntegrationAssociation", DOC_INTEGRATION)],
        "cfn": """Resources:
  InvokePermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref FlowHook
      Action: lambda:InvokeFunction
      Principal: connect.amazonaws.com
      SourceArn: !GetAtt CampusInstance.Arn
  LambdaAssociation:
    Type: AWS::Connect::IntegrationAssociation
    Properties:
      InstanceId: !GetAtt CampusInstance.Id
      IntegrationType: LAMBDA_FUNCTION
      IntegrationArn: !GetAtt FlowHook.Arn
""",
        "cdk": """flowHook.addPermission("ConnectInvoke", {
  principal: new iam.ServicePrincipal("connect.amazonaws.com"),
  sourceArn: instance.attrArn,
});
new connect.CfnIntegrationAssociation(this, "LambdaAssociation", {
  instanceId: instance.attrId,
  integrationType: "LAMBDA_FUNCTION",
  integrationArn: flowHook.functionArn,
});
""",
    },
    "routing": {
        "title": "Hours, queue, and routing profile",
        "blurb": "Priority and delay live on the routing profile queue config, not on the queue name. Lower priority is offered first. Delay holds that queue back.",
        "urls": [("HoursOfOperation", DOC_HOURS), ("Queue", DOC_QUEUE), ("RoutingProfile", DOC_PROFILE)],
        "cfn": """Resources:
  OfficeHours:
    Type: AWS::Connect::HoursOfOperation
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: OfficeHours
      TimeZone: America/Los_Angeles
      Config:
        - Day: MONDAY
          StartTime: { Hours: 8, Minutes: 0 }
          EndTime: { Hours: 18, Minutes: 0 }
  OrdersQueue:
    Type: AWS::Connect::Queue
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: Orders
      HoursOfOperationArn: !GetAtt OfficeHours.HoursOfOperationArn
  BasicProfile:
    Type: AWS::Connect::RoutingProfile
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: Basic
      DefaultOutboundQueueArn: !GetAtt OrdersQueue.QueueArn
      MediaConcurrencies:
        - Channel: VOICE
          Concurrency: 1
      QueueConfigs:
        - QueueReference: { QueueArn: !GetAtt OrdersQueue.QueueArn, Channel: VOICE }
          Priority: 1
          Delay: 0
""",
        "cdk": """const hours = new connect.CfnHoursOfOperation(this, "OfficeHours", {
  instanceArn: instance.attrArn,
  name: "OfficeHours",
  timeZone: "America/Los_Angeles",
  config: [{ day: "MONDAY", startTime: { hours: 8, minutes: 0 }, endTime: { hours: 18, minutes: 0 } }],
});
const queue = new connect.CfnQueue(this, "OrdersQueue", {
  instanceArn: instance.attrArn,
  name: "Orders",
  hoursOfOperationArn: hours.attrHoursOfOperationArn,
});
new connect.CfnRoutingProfile(this, "BasicProfile", {
  instanceArn: instance.attrArn,
  name: "Basic",
  defaultOutboundQueueArn: queue.attrQueueArn,
  mediaConcurrencies: [{ channel: "VOICE", concurrency: 1 }],
  queueConfigs: [{ queueReference: { queueArn: queue.attrQueueArn, channel: "VOICE" }, priority: 1, delay: 0 }],
});
""",
    },
    "workspace": {
        "title": "Approved origin for a custom CCP",
        "blurb": "A custom CCP using amazon-connect-streams has to be served from an origin you approve on the instance. The softphone still needs UDP 3478. Approving the origin does not open that port.",
        "urls": [("ApprovedOrigin", DOC_ORIGIN), ("Streams", "https://github.com/amazon-connect/amazon-connect-streams")],
        "cfn": """Resources:
  CcpOrigin:
    Type: AWS::Connect::ApprovedOrigin
    Properties:
      InstanceId: !GetAtt CampusInstance.Id
      Origin: https://ccp.example.com
""",
        "cdk": """new connect.CfnApprovedOrigin(this, "CcpOrigin", {
  instanceId: instance.attrId,
  origin: "https://ccp.example.com",
});
""",
    },
    "records": {
        "title": "Case and profile are separate services",
        "blurb": "Profiles and cases use their own IAM prefixes. This template only shows the Connect instance those services attach to. Create the profile domain and the Cases domain in the same Region.",
        "urls": [("CfnInstance", DOC_CDK_INSTANCE), ("Customer Profiles", "https://docs.aws.amazon.com/connect/latest/adminguide/customer-profiles.html")],
        "cfn": """Resources:
  CampusInstance:
    Type: AWS::Connect::Instance
    Properties:
      IdentityManagementType: SAML
      InstanceAlias: campus-demo
      Attributes:
        InboundCalls: true
        OutboundCalls: true
        ContactflowLogs: true
""",
        "cdk": """new connect.CfnInstance(this, "CampusInstance", {
  identityManagementType: "SAML",
  instanceAlias: "campus-demo",
  attributes: { inboundCalls: true, outboundCalls: true, contactflowLogs: true },
});
""",
    },
    "channels": {
        "title": "Queue concurrency is per channel",
        "blurb": "Chat, SMS, WhatsApp, and email do not share the voice concurrency of 1. Set MediaConcurrencies for the channel you are opening. Quotas for concurrent chats are still an instance limit.",
        "urls": [("RoutingProfile", DOC_PROFILE)],
        "cfn": """Resources:
  ChatProfile:
    Type: AWS::Connect::RoutingProfile
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: ChatAndVoice
      DefaultOutboundQueueArn: !GetAtt OrdersQueue.QueueArn
      MediaConcurrencies:
        - Channel: VOICE
          Concurrency: 1
        - Channel: CHAT
          Concurrency: 2
""",
        "cdk": """new connect.CfnRoutingProfile(this, "ChatProfile", {
  instanceArn: instance.attrArn,
  name: "ChatAndVoice",
  defaultOutboundQueueArn: queue.attrQueueArn,
  mediaConcurrencies: [
    { channel: "VOICE", concurrency: 1 },
    { channel: "CHAT", concurrency: 2 },
  ],
});
""",
    },
    "analytics": {
        "title": "CTR stream and Contact Lens",
        "blurb": "Contact trace records leave the instance through AWS::Connect::InstanceStorageConfig. ResourceType CONTACT_TRACE_RECORDS and StorageType KINESIS_STREAM is the fan-out path. Contact Lens is an instance attribute plus the recording and analytics block in the flow.",
        "urls": [("InstanceStorageConfig", DOC_STORAGE), ("CfnInstance", DOC_CDK_INSTANCE)],
        "cfn": """Resources:
  CtrStream:
    Type: AWS::Connect::InstanceStorageConfig
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      ResourceType: CONTACT_TRACE_RECORDS
      StorageType: KINESIS_STREAM
      KinesisStreamConfig:
        StreamArn: !GetAtt ContactStream.Arn
""",
        "cdk": """new connect.CfnInstanceStorageConfig(this, "CtrStream", {
  instanceArn: instance.attrArn,
  resourceType: "CONTACT_TRACE_RECORDS",
  storageType: "KINESIS_STREAM",
  kinesisStreamConfig: { streamArn: contactStream.streamArn },
});
""",
    },
    "security": {
        "title": "Instance-scoped IAM, not connect star",
        "blurb": "A security profile is not an IAM policy. This statement allows two read actions on one instance ARN. Lambda's resource policy is a separate document.",
        "urls": [("Service authorization", "https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonconnect.html")],
        "cfn": """Resources:
  OperatorPolicy:
    Type: AWS::IAM::ManagedPolicy
    Properties:
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - connect:DescribeInstance
              - connect:ListQueues
            Resource: !GetAtt CampusInstance.Arn
""",
        "cdk": """new iam.ManagedPolicy(this, "OperatorPolicy", {
  statements: [
    new iam.PolicyStatement({
      actions: ["connect:DescribeInstance", "connect:ListQueues"],
      resources: [instance.attrArn],
    }),
  ],
});
""",
    },
    "resiliency": {
        "title": "Traffic distribution group",
        "blurb": "Global Resiliency uses a traffic distribution group across a supported Region pair. Telephony percentage moves in steps of 10. A second instance you created by hand is not this resource.",
        "urls": [("TrafficDistributionGroup", DOC_TDG)],
        "cfn": """Resources:
  Pair:
    Type: AWS::Connect::TrafficDistributionGroup
    Properties:
      Name: campus-pair
      InstanceArn: !GetAtt SourceInstance.Arn
      Description: Virginia source with an Oregon replica
""",
        "cdk": """new connect.CfnTrafficDistributionGroup(this, "Pair", {
  name: "campus-pair",
  instanceArn: sourceInstance.attrArn,
  description: "Virginia source with an Oregon replica",
});
""",
    },
    "troubleshoot": {
        "title": "Flow logs have to be on",
        "blurb": "The troubleshooting habit starts with a log line. ContactflowLogs on the instance is what lets Set logging behavior write to CloudWatch.",
        "urls": [("AWS::Connect::Instance", DOC_INSTANCE)],
        "cfn": """Resources:
  CampusInstance:
    Type: AWS::Connect::Instance
    Properties:
      IdentityManagementType: SAML
      InstanceAlias: campus-demo
      Attributes:
        InboundCalls: true
        OutboundCalls: true
        ContactflowLogs: true
""",
        "cdk": """new connect.CfnInstance(this, "CampusInstance", {
  identityManagementType: "SAML",
  instanceAlias: "campus-demo",
  attributes: { inboundCalls: true, outboundCalls: true, contactflowLogs: true },
});
""",
    },
    "bridge": {
        "title": "The Connect objects a migration creates",
        "blurb": "CUCM, UCCX, and UCCE have no CloudFormation resource in this API. The objects you create on the Connect side are the queue, the routing profile, and the hours. Map the old skill group onto those, not onto a single queue name.",
        "urls": [("Queue", DOC_QUEUE), ("RoutingProfile", DOC_PROFILE)],
        "cfn": """Resources:
  MigratedQueue:
    Type: AWS::Connect::Queue
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      Name: BillingSkill
      HoursOfOperationArn: !GetAtt OfficeHours.HoursOfOperationArn
      Description: Was a UCCE skill group. Priority now lives on the routing profile.
""",
        "cdk": """new connect.CfnQueue(this, "MigratedQueue", {
  instanceArn: instance.attrArn,
  name: "BillingSkill",
  hoursOfOperationArn: hours.attrHoursOfOperationArn,
  description: "Was a UCCE skill group. Priority now lives on the routing profile.",
});
""",
    },
    "integrations": {
        "title": "Lambda hook for a screen pop",
        "blurb": "Salesforce and ServiceNow do not receive contact attributes unless you write them and call out. The association is what lets the flow invoke the function that sets the customer id.",
        "urls": [("IntegrationAssociation", DOC_INTEGRATION), ("Lambda functions", DOC_LAMBDA_PERM)],
        "cfn": """Resources:
  PopAssociation:
    Type: AWS::Connect::IntegrationAssociation
    Properties:
      InstanceId: !GetAtt CampusInstance.Id
      IntegrationType: LAMBDA_FUNCTION
      IntegrationArn: !GetAtt ScreenPop.Arn
""",
        "cdk": """new connect.CfnIntegrationAssociation(this, "PopAssociation", {
  instanceId: instance.attrId,
  integrationType: "LAMBDA_FUNCTION",
  integrationArn: screenPop.functionArn,
});
""",
    },
    "ecosystem": {
        "title": "Agent event stream for WFM",
        "blurb": "Adherence needs agent events, not a person refreshing a report. ResourceType AGENT_EVENTS and StorageType KINESIS_STREAM is the hook. A second consumer should read the stream, not a second delivery on the instance.",
        "urls": [("InstanceStorageConfig", DOC_STORAGE)],
        "cfn": """Resources:
  AgentEvents:
    Type: AWS::Connect::InstanceStorageConfig
    Properties:
      InstanceArn: !GetAtt CampusInstance.Arn
      ResourceType: AGENT_EVENTS
      StorageType: KINESIS_STREAM
      KinesisStreamConfig:
        StreamArn: !GetAtt AgentStream.Arn
""",
        "cdk": """new connect.CfnInstanceStorageConfig(this, "AgentEvents", {
  instanceArn: instance.attrArn,
  resourceType: "AGENT_EVENTS",
  storageType: "KINESIS_STREAM",
  kinesisStreamConfig: { streamArn: agentStream.streamArn },
});
""",
    },
}
