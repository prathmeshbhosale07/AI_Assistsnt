import ChatSession from "../models/ChatSession.js";
import { getAIResponse } from "../services/aiService.js";

export const sendMessage = async (req, res) => {
  const { sessionId, content } = req.body;

  let session = null;

  if (sessionId) {
    session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user._id
    });
  }

  if (!session) {
    session = await ChatSession.create({
      user: req.user._id,
      messages: []
    });
  }

  session.messages.push({
    role: "user",
    content,
    language: req.user.language
  });

  const assistantReply = await getAIResponse({
    messages: session.messages,
    userLanguage: req.user.language,
    assistantName: req.user.assistantName
  });

  session.messages.push({
    role: "assistant",
    content: assistantReply.content,
    language: req.user.language
  });

  await session.save();

  res.json({
    sessionId: session._id,
    reply: assistantReply.content,
    action: assistantReply.action
  });
};

export const getHistory = async (req, res) => {
  const sessions = await ChatSession.find({
    user: req.user._id
  })
    .sort({ updatedAt: -1 })
    .limit(20);

  res.json(sessions);
};

export const deleteSession = async (req, res) => {
  const { id } = req.params;
  
  const session = await ChatSession.findOne({
    _id: id,
    user: req.user._id
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  await session.deleteOne();
  
  res.json({ message: "Session deleted successfully", sessionId: id });
};