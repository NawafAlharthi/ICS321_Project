const db = require("../config/db");
// NOTE: Authentication is complex. This is a placeholder.
// A real implementation would involve password hashing (e.g., bcrypt),
// session management (e.g., express-session), or token-based auth (e.g., JWT).

// Placeholder Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // --- VERY BASIC PLACEHOLDER ---
  // In a real app, you would query the database for the user,
  // compare hashed passwords, and create a session/token.
  if (username === "admin" && password === "password") {
    // Example credentials
    console.log("Placeholder login successful for:", username);
    // Send back some user info or a token
    res.status(200).json({
      message: "Login successful (placeholder)",
      user: { username: username, role: "admin" },
    });
  } else if (username === "guest" && password === "guest") {
    console.log("Placeholder login successful for:", username);
    res.status(200).json({
      message: "Login successful (placeholder)",
      user: { username: username, role: "guest" },
    });
  } else {
    console.log("Placeholder login failed for:", username);
    res.status(401).json({ message: "Invalid credentials (placeholder)" });
  }
  // --- END PLACEHOLDER ---
};

// Placeholder Logout
exports.logout = async (req, res) => {
  // In a real app, you would destroy the session or invalidate the token.
  console.log("Placeholder logout initiated.");
  res.status(200).json({ message: "Logout successful (placeholder)" });
};

// Send next match reminder emails (Mock implementation)
exports.sendReminders = async (req, res) => {
  const { team_id, tr_id } = req.body;
  if (!team_id || !tr_id) {
    return res
      .status(400)
      .json({ message: "Missing required fields (team_id, tr_id)" });
  }
  try {
    // Get next match for the team in the tournament
    const [matches] = await db.promise().query(
      `SELECT mp.match_no, mp.play_date
       FROM match_played mp
       JOIN tournament_team tt1 ON tt1.team_id = mp.team_id1 AND tt1.tr_id = ?
       JOIN tournament_team tt2 ON tt2.team_id = mp.team_id2 AND tt2.tr_id = ?
       WHERE (mp.team_id1 = ? OR mp.team_id2 = ?) AND mp.play_date > NOW()
       ORDER BY mp.play_date ASC LIMIT 1`,
      [tr_id, tr_id, team_id, team_id]
    );
    if (matches.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No upcoming matches found for this team in this tournament.",
        });
    }
    const nextMatch = matches[0];
    // Get all players' emails (mock: just their IDs)
    const [players] = await db.promise().query(
      `SELECT p.kfupm_id, p.name
       FROM team_player tp
       JOIN person p ON tp.player_id = p.kfupm_id
       WHERE tp.team_id = ? AND tp.tr_id = ?`,
      [team_id, tr_id]
    );
    // Mock sending email
    players.forEach((player) => {
      console.log(
        `[MOCK EMAIL] Reminder to ${player.name} (ID: ${player.kfupm_id}): Next match #${nextMatch.match_no} on ${nextMatch.play_date}`
      );
    });
    res
      .status(200)
      .json({
        message: `Reminders sent to ${players.length} team members (mock).`,
      });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res
      .status(500)
      .json({ message: "Failed to send reminders", error: error.message });
  }
};
