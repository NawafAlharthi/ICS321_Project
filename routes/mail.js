// routes/mail.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tobegoodman5@gmail.com", // غيّره لإيميلك
    pass: `xzjwcwikkivslqln`, // استخدم App Password لو Gmail
  },
});

router.post("/send-reminder/:teamId", async (req, res) => {
  const teamId = req.params.teamId;

  try {
    const [matches] = await db.promise().query(
      `
        SELECT 
          mp.match_no, mp.play_date, mp.team_id1, mp.team_id2,
          t1.team_name AS team1_name,
          t2.team_name AS team2_name,
          v.venue_name
        FROM match_played mp
        JOIN team t1 ON mp.team_id1 = t1.team_id
        JOIN team t2 ON mp.team_id2 = t2.team_id
        JOIN venue v ON mp.venue_id = v.venue_id
        WHERE (mp.team_id1 = ? OR mp.team_id2 = ?)
          AND mp.play_date > NOW()
        ORDER BY mp.play_date ASC
        LIMIT 1
      `,
      [teamId, teamId]
    );

    if (matches.length === 0) {
      return res.status(200).send("No upcoming matches found for this team.");
    }

    const match = matches[0];
    const opponent =
      match.team_id1 == teamId ? match.team2_name : match.team1_name;

    // 🧠 جلب إيميلات اللاعبين في الفريق
    const [players] = await db.promise().query(
      `
        SELECT p.email, p.name
        FROM team_player tp
        JOIN player pl ON tp.player_id = pl.player_id
        JOIN person p ON pl.player_id = p.kfupm_id
        WHERE tp.team_id = ?
      `,
      [teamId]
    );

    const emails = players.map((player) => player.email).filter(Boolean);

    if (emails.length === 0) {
      return res.status(200).send("No players with emails found in this team.");
    }

    // 📧 إرسال الإيميلات
    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: emails,
      subject: `Upcoming Match Reminder`,
      text: `Hello team,
  
  You have a match against ${opponent} on ${match.play_date.toDateString()} at ${
        match.venue_name
      }.
  
  Good luck!
  
  — Soccer@KFUPM`,
    });

    res.send("Reminder sent successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending reminder.");
  }
});

router.get("/teams", async (req, res) => {
  try {
    const [teams] = await db.promise().query(`
        SELECT team_id, team_name FROM team
      `);
    res.json(teams);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
});
module.exports = router;
