export const getMe = async (req, res) => {
    res.json(req.user);
  };
  
  export const updatePreferences = async (req, res) => {
    const { avatar, assistantName, language, voiceProfile } = req.body;
  
    if (avatar !== undefined) req.user.avatar = avatar;
    if (assistantName !== undefined) req.user.assistantName = assistantName;
    if (language !== undefined) req.user.language = language;
    if (voiceProfile !== undefined) req.user.voiceProfile = voiceProfile;
  
    await req.user.save();
  
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      assistantName: req.user.assistantName,
      language: req.user.language,
      voiceProfile: req.user.voiceProfile
    });
  };