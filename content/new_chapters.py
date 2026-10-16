"""Chapters added from pages opened in October 2026.

Prose stays inside what those pages say. A number in a lesson is a number
from the page named in cite.
"""

PROFICIENCY = "https://docs.aws.amazon.com/connect/latest/adminguide/proficiency-routing.html"
CRITERIA = "https://docs.aws.amazon.com/connect/latest/adminguide/set-routing-criteria.html"
PROFILES = "https://docs.aws.amazon.com/connect/latest/adminguide/routing-profiles.html"
FORECAST = "https://docs.aws.amazon.com/connect/latest/adminguide/forecasting.html"
INTERVAL = "https://docs.aws.amazon.com/connect/latest/adminguide/set-forecast-scheduling-interval.html"
WFM = "https://docs.aws.amazon.com/connect/latest/adminguide/forecasting-capacity-planning-scheduling.html"
CAPACITY = "https://docs.aws.amazon.com/connect/latest/adminguide/capacity-planning.html"
LENS = "https://docs.aws.amazon.com/connect/latest/adminguide/contact-lens.html"
ENABLE = "https://docs.aws.amazon.com/connect/latest/adminguide/enable-analytics.html"
EVAL = "https://docs.aws.amazon.com/connect/latest/adminguide/create-evaluation-forms.html"
SF = "https://docs.aws.amazon.com/connect/latest/adminguide/salesforce-integration.html"
SF_CTI = "https://github.com/amazon-connect/amazon-connect-salesforce-cti"
TRANSFER = "https://docs.aws.amazon.com/connect/latest/adminguide/transfer-to-phone-number.html"
FLEX = "https://www.twilio.com/docs/flex/admin-guide/integrations/salesforce"
SIP = "https://www.twilio.com/docs/sip-trunking/call-transfer"


def L(id, track, title, why, paras, points, mistake, num, diagram, flow, url, source):
    return {
        "id": id, "track": track, "title": title, "why": why, "paras": paras,
        "points": points, "mistake": mistake, "number": num, "diagram": diagram,
        "flow": flow, "cite": {"url": url, "title": source},
    }


def path(nodes, caption=""):
    return {"type": "path", "nodes": [{"id": str(i), "label": n} for i, n in enumerate(nodes)], "caption": caption}


def flow_of(steps):
    return [{"label": a, "detail": b} for a, b in steps]


EXTRA_LESSONS = [
    L("route-skills", "routing", "Proficiencies filter inside a queue",
      "A proficiency chooses among agents who already have the queue. It does not replace the queue.",
      ["The proficiency page lists four steps: create predefined attributes, assign them to agents, set routing criteria, then transfer the contact to a queue. Connect runs the criteria only after the contact is enqueued. That page says queues are still necessary, and that priority and delay still work as they do without proficiencies.",
       "Its worked example looks for French and AWS DynamoDB, then relaxes the levels on later steps. It says those 30-second step lengths are illustrative. For a compliance case the same page documents a Never Expire option so the joined agent meets a minimum."],
      ["Proficiency routing is documented for voice, chat, task, and email.",
       "AND and OR are the Boolean operators. Comparison is >=, or a range of levels from 1 to 5.",
       "The same attribute cannot appear more than once in one expression.",
       "A custom predefined-attribute name cannot start with aws: or connect:."],
      "Deleting the queue because a proficiency should be enough. The criteria never runs until the contact is in a queue.",
      {"k": "Record", "v": "3", "n": "Latest routing-criteria updates stored on the contact record"},
      path(["Attribute", "Agent level", "Criteria", "Queue"]),
      flow_of([("Attribute", "Create the predefined attribute."), ("Agent", "Assign a level."), ("Criteria", "Set the steps."), ("Queue", "Transfer to queue runs them.")]),
      PROFICIENCY, "Set up routing based on agent proficiencies"),
    L("route-criteria", "routing", "Routing criteria, expiry, and a preferred agent",
      "Set routing criteria does nothing until Transfer to queue, and it does nothing inside an agent queue.",
      ["The block puts an ordered list of steps on a contact of any channel. Each step is one or more requirements. You can use the block in an inbound flow, a customer queue flow, a transfer-to-agent flow, or a transfer-to-queue flow. After every timed step expires, Connect offers the contact to the longest available agent who has that queue on a routing profile.",
       "A step can name preferred agents by user ID, up to 10. The contact stays limited to those agents until the timer ends, even if an agent is offline, busy, in a custom status, or deleted. After a Customer Profiles lookup you can point a step at $.Customer.CalculatedAttributes._last_agent_id."],
      ["An AND step can use up to eight attributes. An OR step can use up to three conditions, and only when you set the criteria dynamically.",
       "NOT is also dynamic only. OR sits at the top. AND can sit inside OR.",
       "Each step needs a timer. The last step may be set never to expire.",
       "A very short DurationInSeconds can let ordinary queue routing compete with the proficiency step."],
      "Expecting the criteria to follow the contact into an agent queue. The block page says it does not take effect there.",
      {"k": "Preferred", "v": "10", "n": "Maximum agents in one preferred-agent step"},
      path(["Set criteria", "Transfer to queue", "Step timer", "Longest available"]),
      flow_of([("Set", "Manually or from Lambda JSON."), ("Transfer", "A standard queue activates it."), ("Expire", "Move to the next step."), ("Fallback", "Longest available agent on the profile.")]),
      CRITERIA, "Set routing criteria"),
    L("wfm-interval", "ecosystem", "The forecast interval is a one-time choice",
      "Scheduling and capacity planning both wait on a forecast, and the interval cannot be edited later.",
      ["Forecasting predicts contact volume and handle time from historical metrics. Short-term forecasts update daily and are the input for scheduling up to 18 weeks ahead. Long-term forecasts update every week, on the weekday you created them, and are the input for capacity planning up to 64 weeks ahead.",
       "Before any of that, set the forecast and schedule interval to 15 or 30 minutes. The interval page says you need Forecast and schedule interval - Edit, you must set it before you create forecast groups, and you cannot change it later. Intraday forecasts update every 15 minutes, and only for a queue-channel with at least 5,000 unique contacts a week over the last 4 weeks."],
      ["The first short-term or long-term forecast is typically ready within 4 hours, and often in about 1 hour.",
       "Only the newest forecast stays on the page. Download a copy if you need to keep that day.",
       "The forecasting page lists the order: interval, forecast groups, historical import, create, inspect, publish.",
       "A change to the forecast group, such as adding or removing a queue, starts that computation again."],
      "Trying to change 15 minutes to 30 minutes after the first forecast group exists.",
      {"k": "Interval", "v": "15 or 30", "n": "Minutes. Set once. Cannot be changed."},
      path(["Interval", "Forecast group", "History", "Publish"]),
      flow_of([("Permission", "Forecast and schedule interval - Edit."), ("Choose", "15 or 30 minutes."), ("Group", "Queues that share a forecast."), ("Publish", "Hand it to schedulers.")]),
      INTERVAL, "Set the forecast and schedule interval"),
    L("wfm-capacity", "ecosystem", "Hiring plans and scheduling plans",
      "A hiring plan and a scheduling plan do not read the same forecasts.",
      ["A capacity plan turns forecasts and a scenario into staffing targets. A Hiring plan estimates long-term full-time equivalents, up to 64 weeks, and needs both a long-term and a short-term forecast. The capacity page recommends at least 4 weeks of overlap and requires at least 1 day.",
       "A Scheduling plan needs only a published short-term forecast. It returns headcount in 15- or 30-minute intervals, matching that forecast, and the plan dates must sit inside the forecast dates. Plan override is not available for a Scheduling plan."],
      ["Create a scenario before you create the plan.",
       "Shrinkage and available full-time equivalents can be imported. Hiring plans use day-level files. Scheduling plans use interval-level files.",
       "Task and email plans can start from an automatic backlog when you use an average time to complete.",
       "The getting-started list ends with review, then publish. Override and re-run are for hiring plans."],
      "Building a hiring plan from a short-term forecast alone.",
      {"k": "Hiring", "v": "64 weeks", "n": "Long-term full-time equivalent estimates"},
      path(["Scenario", "Both forecasts", "Hiring plan", "Publish"]),
      flow_of([("Scenario", "Service goals and shrinkage."), ("Forecasts", "Long-term and short-term, overlapping."), ("Plan", "Hiring or scheduling."), ("Publish", "Share the output.")]),
      CAPACITY, "Capacity planning"),
    L("wfm-schedule", "ecosystem", "Publish the schedule before you talk about adherence",
      "Adherence metrics appear after schedules are published.",
      ["The forecasting and scheduling overview describes forecasting, scheduling, schedule adherence, and capacity planning. Scheduling builds agent schedules for day-to-day work. Adherence metrics are available after the agent schedules are published.",
       "The forecasting page says you cannot build a schedule or a capacity plan until a corresponding forecast exists. Publish the short-term forecast when schedulers should use it. That page shows when a forecast was last updated and when it was published."],
      ["Forecasts update on their own. Publishing is the step that hands one to schedulers.",
       "Short-term forecasts feed scheduling, up to 18 weeks ahead.",
       "Long-term forecasts feed capacity planning, up to 64 weeks ahead.",
       "The overview names administrator, forecaster, scheduler, capacity planner, and agent as the people in the workflow."],
      "Judging adherence against a schedule that was never published.",
      {"k": "Adherence", "v": "Published", "n": "Metrics exist after schedules are published"},
      path(["Short-term forecast", "Publish", "Schedule", "Adherence"]),
      flow_of([("Forecast", "Short-term, for scheduling."), ("Publish", "Make it the one schedulers use."), ("Schedule", "Day-to-day shifts."), ("Adhere", "Only after publish.")]),
      WFM, "Forecasting and agent scheduling"),
    L("lens-on", "analytics", "Turn conversational analytics on for the contact",
      "A new instance already has the feature. A contact still needs the flow block.",
      ["New instances have conversational analytics enabled. Older instances, or instances where it was turned off, need Analytics tools, Enable conversational analytics, and Save in the console. The contact then needs a Set recording and analytics behavior block. New flows use Set recording, analytics and processing behavior. The enable page says the steps match.",
       "Voice needs call recording On for the agent and the customer, then Enable speech analytics. You choose post-call or real-time, and a language. Chat analytics returns both real-time and post-chat results. Email uses the newer block, placed before the email is routed, and can add a contact summary."],
      ["A transfer creates another contact ID. Add the block again. A queue-to-queue transfer copies the configuration.",
       "With several analytics blocks, real-time uses the first. Post-call agent analytics uses the last.",
       "From October 2026, automated-interaction analytics moves toward real-time and uses the first block. The page says Customer Basic instances stay on post-contact analytics using the last block.",
       "Sentiment starts on when the language supports it. Redaction can miss sensitive data. The page says it is not a HIPAA de-identification."],
      "Enabling the instance and never placing the block. If a contact has no analytics, the enable page says to read the flow logs.",
      {"k": "Parties", "v": "2", "n": "More than agent and customer can degrade the transcript"},
      path(["Instance", "Recording block", "Language", "Transcript"]),
      flow_of([("Instance", "On for new instances."), ("Block", "Agent and customer audio for voice."), ("Channel", "Speech, chat, or email."), ("Transfer", "Set the block on the next contact too.")]),
      ENABLE, "Enable conversational analytics"),
    L("lens-eval", "analytics", "Evaluation forms, from a blank page to a rule",
      "A form can be filled by a person, by a category, or by a model. Activation is still your step.",
      ["You can create a form from a sample, from a PDF of at most 2 MB, from a blank form, or from JSON exported by another instance. The create permission named on the page is Analytics and Optimization - Evaluation forms - manage form definitions - Create. Sections and questions can carry weights.",
       "Automation can answer questions from contact categories or from a model that reads the question title, the instructions, and the transcript. Fully automated submission has to be turned on before you activate the form. Activation then asks you to create a rule that chooses which contacts get that form."],
      ["Sample forms cover agent-handled and self-service interactions.",
       "The page names five outcome metrics on sample forms: customer satisfaction, churn propensity, successful sale, and full or partial self-service success.",
       "A PDF import comes back as a draft, typically within one minute, for you to review.",
       "You can save a draft and leave. Activation is a later step, after preview and validation."],
      "Activating a form and expecting every answer to fill itself before automation is on for each question.",
      {"k": "PDF", "v": "2 MB", "n": "Maximum file when importing a form"},
      path(["Draft", "Questions", "Automation", "Activate", "Rule"]),
      flow_of([("Draft", "Sample, PDF, blank, or JSON."), ("Score", "Weights on sections and questions."), ("Automate", "Category or model, per question."), ("Activate", "Then the rule that submits it.")]),
      EVAL, "Create an evaluation form"),
    L("crm-sf", "integrations", "Salesforce starts as a CCP embed in a sandbox",
      "The admin guide's Salesforce page is a Contact Control Panel inside Salesforce, installed in a sandbox first.",
      ["That page says the CTI Adapter's core job is a WebRTC Contact Control Panel within Salesforce. It says the integration has two components. It says to install the package in a Salesforce sandbox first, then configure the Salesforce Call Center.",
       "The public repository amazon-connect-salesforce-cti is the documentation home named for that adapter. This room stops at those two pages."],
      ["The softphone in the embed is the Connect CCP.",
       "Sandbox first. Production is a later copy of a configuration you have already tried.",
       "The page points at separate installation guides for Lightning and for Classic.",
       "This room does not invent screen-pop fields. Read the adapter guide before you promise a pop."],
      "Installing the package in the production org on the first try.",
      {"k": "First install", "v": "Sandbox", "n": "Then configure the Call Center"},
      path(["Sandbox", "Package", "Call Center", "CCP"]),
      flow_of([("Sandbox", "Install there first."), ("Package", "The managed CTI adapter."), ("Call Center", "Salesforce configuration."), ("CCP", "WebRTC panel inside Salesforce.")]),
      SF, "Embed the CCP in Salesforce"),
    L("cpaas-twilio", "integrations", "Twilio Flex is a different product, documented on its own site",
      "This lab did not open an AWS page that names Twilio as an Amazon Connect connector.",
      ["Twilio's Flex guide says the integration embeds the Flex agent UI in Salesforce. Classic and Lightning are both in that guide. It lists voice, web chat, SMS, and WhatsApp, plus click-to-dial, screen pop, activity logging, and single sign-on. Flex can sit inside Salesforce, or Salesforce can sit inside Flex. The same page says Salesforce Open CTI, including this Flex integration, is scheduled to retire on 28 February 2028.",
       "Amazon Connect's Transfer to phone number block is a different seam. The block page says voice is supported and chat, task, and email take the error branch. Twilio's SIP REFER page describes transfers on Twilio Elastic SIP Trunking. That is Twilio's trunk, not the Connect flow block."],
      ["The Flex guide tells you to add https://flex.twilio.com as a Salesforce trusted URL.",
       "It says an outbound call should start with the Salesforce record already open, or the activity may log on the wrong record.",
       "If third-party cookies are blocked, that guide says to turn on Login using popup.",
       "Draw Connect and Flex as two products. Do not draw one arrow that claims a native connector."],
      "Telling a review that Amazon Connect includes Twilio because both products can place a call.",
      {"k": "Open CTI", "v": "2028-02-28", "n": "Retirement date on the Flex Salesforce page"},
      path(["Flex UI", "Salesforce", "Trusted URL", "Not Connect"]),
      flow_of([("Read Twilio", "The Flex Salesforce guide."), ("Read AWS", "Transfer to phone number is voice."), ("Do not merge", "No connector page was opened."), ("Date", "Open CTI retirement is on the Flex page.")]),
      FLEX, "Integrate Flex with Salesforce"),
]

EXTRA_GLOSSARY = [
    ("Predefined attribute", "A name and value you create so routing can test it. connect:Language already exists. A custom name cannot start with aws: or connect:.", "routing", PROFICIENCY, "Set up routing based on agent proficiencies"),
    ("Routing step", "One requirement inside routing criteria, with a timer. After the timed steps expire, the contact goes to the longest available agent who has the queue.", "routing", CRITERIA, "Set routing criteria"),
    ("Preferred agent step", "A routing step that names up to 10 user IDs. The contact stays with those agents until the timer ends, even if they are offline.", "routing", CRITERIA, "Set routing criteria"),
    ("Short-term forecast", "A volume and handle-time forecast that updates daily. The forecasting page says to use it for scheduling up to 18 weeks ahead.", "ecosystem", FORECAST, "Forecasting"),
    ("Long-term forecast", "A forecast that updates weekly, on the weekday you created it. The forecasting page says to use it for capacity planning up to 64 weeks ahead.", "ecosystem", FORECAST, "Forecasting"),
    ("Forecast interval", "The 15-minute or 30-minute grain for short-term forecasts and schedules. Set it once, before forecast groups. It cannot be changed.", "ecosystem", INTERVAL, "Set the forecast and schedule interval"),
    ("Hiring plan", "A capacity plan for long-term full-time equivalents, up to 64 weeks. It needs a long-term forecast and a short-term forecast.", "ecosystem", CAPACITY, "Capacity planning"),
    ("Scheduling plan", "A capacity plan of headcount by the short-term interval. It needs a published short-term forecast. Plan override is not available.", "ecosystem", CAPACITY, "Capacity planning"),
    ("Speech analytics", "Conversational analytics on a voice contact. The enable page requires agent and customer call recording.", "analytics", ENABLE, "Enable conversational analytics"),
    ("Evaluation form", "Sections and questions used to score a contact. Answers can be automated from categories or from a model, then the form is activated.", "analytics", EVAL, "Create an evaluation form"),
    ("CTI Adapter", "The Amazon Connect package that places a WebRTC CCP inside Salesforce. The admin guide says to install it in a sandbox first.", "integrations", SF, "Embed the CCP in Salesforce"),
    ("Flex Salesforce embed", "Twilio's guide for putting the Flex agent UI in Salesforce, or Salesforce inside Flex. It is not an Amazon Connect connector page.", "integrations", FLEX, "Integrate Flex with Salesforce"),
]

EXTRA_SOURCES = {
    "route-skills": [PROFICIENCY, CRITERIA, PROFILES],
    "route-criteria": [CRITERIA, PROFICIENCY, PROFILES],
    "wfm-interval": [INTERVAL, FORECAST, WFM],
    "wfm-capacity": [CAPACITY, FORECAST, WFM],
    "wfm-schedule": [WFM, FORECAST, CAPACITY],
    "lens-on": [ENABLE, LENS],
    "lens-eval": [EVAL, LENS, ENABLE],
    "crm-sf": [SF, SF_CTI],
    "cpaas-twilio": [FLEX, TRANSFER, SIP, SF],
}

CHAPTERS = [
    {
        "id": "routing",
        "current": "ch-routing",
        "menu": "Routing",
        "title": "Routing profiles, queues, and skills",
        "line": "Who can take the contact, and in what order",
        "icon": "🔀",
        "hue": "#3dcfb4",
        "href": "chapters/routing.html",
        "blurb": "Start with the queue and the one profile on the agent. Then hours and quick connects. Then proficiency steps, which run only after the contact is queued.",
        "levels": [
            ("Fundamentals", "A queue waits. One profile links it to agents.", ["route-queue", "route-profile"]),
            ("Working", "Hours, overrides, and the transfer flow on a quick connect.", ["route-hours", "route-quick"]),
            ("Advanced", "Predefined attributes, step timers, and a preferred agent.", ["route-skills", "route-criteria"]),
        ],
    },
    {
        "id": "forecasting",
        "current": "ch-forecast",
        "menu": "Forecasting",
        "title": "Forecasting, capacity, and schedules",
        "line": "Interval, forecast, hiring plan, then adherence",
        "icon": "📅",
        "hue": "#f0c56a",
        "href": "chapters/forecasting.html",
        "blurb": "Set the 15- or 30-minute interval once. Publish a forecast before a schedule or a capacity plan. Adherence metrics follow a published schedule.",
        "levels": [
            ("Fundamentals", "What a forecast predicts, and the interval you cannot undo.", ["wfm-interval", "eco-wfm"]),
            ("Working", "Short-term for scheduling. Long-term for capacity.", ["wfm-schedule", "wfm-capacity"]),
            ("Advanced", "A second WFM tool listens to agent events. It is not a second copy of the native schedule.", ["eco-wfm-3p", "an-agents"]),
        ],
    },
    {
        "id": "contact-lens",
        "current": "ch-lens",
        "menu": "Contact Lens",
        "title": "Contact Lens, quality, and analytics",
        "line": "Transcripts, redaction, metrics, and evaluation forms",
        "icon": "🔎",
        "hue": "#8eb8ff",
        "href": "chapters/contact-lens.html",
        "blurb": "The admin guide now calls Contact Lens conversational analytics. Enable it on the contact, then read the transcript, then score it with a form.",
        "levels": [
            ("Fundamentals", "The name, the recording block, and a contact that actually has analytics.", ["an-lens", "lens-on"]),
            ("Working", "Trace records, real-time boards, and an empty transcript.", ["an-ctr", "an-metrics", "eco-lens-ops"]),
            ("Advanced", "Evaluation forms, weights, and a rule that submits the form.", ["lens-eval", "eco-qm"]),
        ],
    },
    {
        "id": "crm",
        "current": "ch-crm",
        "menu": "CRM and CPaaS",
        "title": "CRM and CPaaS bridges",
        "line": "Salesforce, Twilio's own docs, and the phone-number seam",
        "icon": "🤝",
        "hue": "#7eb6ff",
        "href": "chapters/crm.html",
        "blurb": "Salesforce on Amazon Connect is a CCP embed, sandbox first. Twilio Flex documents a different embed. This chapter does not invent a connector between them.",
        "levels": [
            ("Fundamentals", "One case owner, and the attribute written before the agent is offered the contact.", ["int-sf", "crm-sf", "eco-crm"]),
            ("Working", "ServiceNow's published voice guide, and Teams as chat in the AWS blog.", ["int-sn", "int-teams"]),
            ("Advanced", "Twilio's Flex page, read as Twilio. Connect's external transfer is voice only.", ["cpaas-twilio", "int-cucm"]),
        ],
    },
    {
        "id": "ecosystem",
        "current": "ecosystem",
        "menu": "Ecosystem",
        "title": "Ecosystem",
        "line": "Glossary, mind map, sisters, maps, bridges, and hooks",
        "icon": "🌐",
        "hue": "#c4b5fd",
        "href": "ecosystem.html",
        "blurb": "Connect owns the live contact. The glossary, the mind map, and the seams around it are how the rest of the operation stays attachable.",
        "levels": [
            ("Fundamentals", "Glossary, mind map, and the sister systems that must store a key.", ["eco-glossary", "eco-mind", "eco-why"]),
            ("Working", "Integration maps and the bridges from the platforms you already run.", ["eco-map", "br-map"]),
            ("Advanced", "Future hooks: events, streams, views, and modules, not a CCP scraper.", ["eco-future", "eco-ai-ops"]),
        ],
    },
]
