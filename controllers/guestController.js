const db = require("../config/db");

// Browse all match results of a given tournament sorted by date
exports.browseMatches = async (req, res) => {
  const { tr_id } = req.params;
  const sort_by_date = req.query.sort || "asc"; // Optional query param, assume 'asc' or 'desc'

  if (!tr_id) {
    return res
      .status(400)
      .json({ message: "Tournament ID (tr_id) is required in the path." });
  }

  try {
    let orderByClause = "ORDER BY mp.play_date ASC"; // Default sort
    if (sort_by_date && sort_by_date.toLowerCase() === "desc") {
      orderByClause = "ORDER BY mp.play_date DESC";
    }

    // Fetch match details along with team names and scores for each team
    const query = `
            SELECT
    mp.match_no,
    mp.play_stage,
    DATE_FORMAT(mp.play_date,'%Y‑%m‑%d') AS play_date,   -- صيغة تاريخ واضحة
    t1.team_name  AS team1_name,
    t2.team_name  AS team2_name,

    /* النتيجة */
    COALESCE(md1.goal_score,
             SUBSTRING_INDEX(mp.goal_score,'-',1),
             0)                        AS team1_score,
    COALESCE(md2.goal_score,
             SUBSTRING_INDEX(mp.goal_score,'-',-1),
             0)                        AS team2_score,

    mp.decided_by,
    v.venue_name,
    mp.audience,
    p.name       AS player_of_match_name
FROM match_played mp
JOIN team t1 ON mp.team_id1 = t1.team_id
JOIN team t2 ON mp.team_id2 = t2.team_id
JOIN venue v ON mp.venue_id = v.venue_id
LEFT JOIN player  pl ON mp.player_of_match = pl.player_id
LEFT JOIN person  p  ON pl.player_id       = p.kfupm_id
LEFT JOIN match_details md1
       ON md1.match_no = mp.match_no AND md1.team_id = mp.team_id1
LEFT JOIN match_details md2
       ON md2.match_no = mp.match_no AND md2.team_id = mp.team_id2
WHERE EXISTS (
    SELECT 1
    FROM tournament_team tt
    WHERE (tt.team_id = mp.team_id1 OR tt.team_id = mp.team_id2)
      AND tt.tr_id   = ?
)
ORDER BY mp.play_date ASC;

        `;
    // Note: The WHERE clause assumes matches belong to a tournament if at least one participating team is in that tournament.
    // A direct tr_id FK in match_played would be cleaner if matches are strictly tied to one tournament.

    const [matches] = await db.promise().query(query, [tr_id]);

    if (matches.length === 0) {
      // Check if tournament exists but has no matches, or if tournament ID is invalid
      const [[tournamentExists]] = await db
        .promise()
        .query("SELECT 1 FROM tournament WHERE tr_id = ?", [tr_id]);
      if (!tournamentExists) {
        return res.status(404).json({ message: "Tournament not found." });
      }
      return res.status(200).json([]); // Tournament exists, but no matches found
    }

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error browsing matches:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve matches", error: error.message });
  }
};

// View top goal scorers (across all tournaments)
exports.getTopScorers = async (req, res) => {
  try {
    const query = `
      SELECT
  gd.player_id,
  p.name          AS player_name,
  t.team_name,
  COUNT(*)        AS total_goals
FROM goal_details gd
JOIN person p ON gd.player_id = p.kfupm_id
JOIN team   t ON gd.team_id   = t.team_id   -- <‑ هذا هو المفتاح الصحيح
WHERE gd.goal_type <> 'O'
GROUP BY gd.player_id, p.name, t.team_name
ORDER BY total_goals DESC
LIMIT 10;

    `;

    const [scorers] = await db.promise().query(query);
    res.status(200).json(scorers);
  } catch (error) {
    console.error("Error getting top scorers:", error);
    res.status(500).json({
      message: "Failed to retrieve top scorers",
      error: error.message,
    });
  }
};

// List red-carded players per team (in a specific tournament context?)
// Requirement: "List red-carded players per team"
// Interpretation: For a given team, list players who received red cards in any match.
// Let's assume team_id is provided.
exports.listRedCardedPlayers = async (req, res) => {
  const { team_id } = req.params;

  if (!team_id) {
    return res
      .status(400)
      .json({ message: "Team ID is required in the path." });
  }

  try {
    // Check if team exists
    const [[teamExists]] = await db
      .promise()
      .query("SELECT 1 FROM team WHERE team_id = ?", [team_id]);
    if (!teamExists) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Query to find players with red cards for the specified team
    const query = `
            SELECT DISTINCT
                pb.player_id,
                p.name AS player_name,
                mp.match_no,
                mp.play_date
            FROM player_booked pb
            JOIN person p ON pb.player_id = p.kfupm_id
            JOIN match_played mp ON pb.match_no = mp.match_no
            WHERE pb.team_id = ? AND pb.sent_off = 'Y'
            ORDER BY mp.play_date DESC, p.name ASC;
        `;

    const [redCardedPlayers] = await db.promise().query(query, [team_id]);
    res.status(200).json(redCardedPlayers);
  } catch (error) {
    console.error("Error listing red-carded players:", error);
    res.status(500).json({
      message: "Failed to retrieve red-carded players",
      error: error.message,
    });
  }
};

// Show full team compositions (players, coach, manager)
exports.getTeamComposition = async (req, res) => {
  const { team_id } = req.params;

  try {
    const sql = `
      SELECT
        tp.player_id            AS member_id,
        pr.name                 AS member_name,
        pp.position_desc        AS role,
        NULL                    AS extra_status
      FROM team_player tp
      JOIN player pl   ON tp.player_id      = pl.player_id
      JOIN person pr   ON pl.player_id      = pr.kfupm_id
      JOIN playing_position pp ON pl.position_to_play = pp.position_id
      WHERE tp.team_id = ?

      UNION ALL

      SELECT
        ts.support_id           AS member_id,
        pr.name                 AS member_name,
        CASE ts.support_type
             WHEN 'CH' THEN 'Coach'
             WHEN 'AC' THEN 'Assistant Coach'
        END                     AS role,
        'Staff'                 AS extra_status
      FROM team_support ts
      JOIN person pr ON ts.support_id = pr.kfupm_id
      WHERE ts.team_id = ?

      ORDER BY role, member_name;
    `;

    const [rows] = await db.promise().query(sql, [team_id, team_id]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting team composition:", err);
    return res
      .status(500)
      .json({ message: "Failed to retrieve team composition" });
  }
};
