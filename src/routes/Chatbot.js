const express = require("express");
const chatbotRouter = express.Router();
const Ticket = require("../models/Ticket");

async function createTicket(req, queryResult) {
  const { title, description, severity, category } =
    queryResult.parameters.fields;
  console.log("Creating ticket");
  await Ticket.create({
    title: title.stringValue,
    description: description.stringValue,
    severity: severity.stringValue,
    category: category.stringValue,
    authorID: req.user.id,
  });
}

chatbotRouter.get("/test", async (req, res) => {
  return res.render("./chatbot-test");
});

// user must be logged in to interact with the chatbot
chatbotRouter.get("/:query", async (req, res) => {
  const serviceAccount = require("../../keyhub-dialogflow-service-account.json");
  const { SessionsClient } = require("@google-cloud/dialogflow");
  const projectId = "keyhub-357302";
  const sessionId = req.sessionID;
  const sessionClient = new SessionsClient({ credentials: serviceAccount });
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const query = req.params.query;

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en-US",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const queryResult = responses[0].queryResult;

  const { displayName, endInteraction } = queryResult.intent;

  // create ticket
  if (
    displayName == "Create Ticket" &&
    endInteraction == true &&
    req.isAuthenticated() == true
  ) {
    createTicket(req, queryResult);
  }

  return res.send({ queryResult });
});

module.exports = chatbotRouter;
