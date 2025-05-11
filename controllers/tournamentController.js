const db = require("../config/db");

// Add a new tournament
exports.addTournament = async (req, res) => {
  const { tr_id, tr_name, start_date, end_date } = req.body;

  // Basic validation
  if (!tr_id || !tr_name || !start_date || !end_date) {
    return res.status(400).json({
      message: "Missing required fields (tr_id, tr_name, start_date, end_date)",
    });
  }

  try {
    const query =
      "INSERT INTO tournament (tr_id, tr_name, start_date, end_date) VALUES (?, ?, ?, ?)";
    const [result] = await db
      .promise()
      .query(query, [tr_id, tr_name, start_date, end_date]);
    res
      .status(201)
      .json({ message: "Tournament added successfully", tournamentId: tr_id });
  } catch (error) {
    console.error("Error adding tournament:", error);
    // Handle potential duplicate entry error (UNIQUE constraint on tr_name or PK constraint on tr_id)
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Tournament ID or Name already exists." });
    }
    res
      .status(500)
      .json({ message: "Failed to add tournament", error: error.message });
  }
};

// Delete a tournament
exports.deleteTournament = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Tournament ID is required" });
  }

  try {
    // Note: Due to FOREIGN KEY constraints with ON DELETE CASCADE (e.g., in tournament_team),
    // deleting a tournament will also delete related records in other tables.
    // Consider if this is the desired behavior or if checks/soft delete are needed.
    const query = "DELETE FROM tournament WHERE tr_id = ?";
    const [result] = await db.promise().query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    res
      .status(500)
      .json({ message: "Failed to delete tournament", error: error.message });
  }
};

// Add a team to a tournament
exports.addTeamToTournament = async (req, res) => {
  const { tr_id } = req.params;
  const { team_id, team_name, team_group } = req.body; // Assuming team might be created here or selected

  if (!tr_id || !team_id || !team_group) {
    return res.status(400).json({
      message: "Missing required fields (tr_id, team_id, team_group)",
    });
  }

  // We need a transaction here to ensure atomicity: create team if not exists, then add to tournament_team
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 1. Check if team exists, if not, create it (handle potential team_name uniqueness if needed)
    // For simplicity, let's assume team_id refers to an existing team for now.
    // A more robust implementation would check/create the team.
    const [teamExists] = await connection.query(
      "SELECT team_id FROM team WHERE team_id = ?",
      [team_id]
    );
    if (teamExists.length === 0) {
      // If team_name is provided, create the team
      if (team_name) {
        await connection.query(
          "INSERT INTO team (team_id, team_name) VALUES (?, ?)",
          [team_id, team_name]
        );
      } else {
        throw new Error(
          `Team with ID ${team_id} does not exist and no team_name provided to create it.`
        );
      }
    }

    // 2. Add team to the tournament_team table
    const insertQuery = `
INSERT INTO tournament_team (
  team_id, tr_id, team_group,
  match_played, won, draw, lost,
  goal_for, goal_against, goal_diff,
  points, group_position
) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0);
`;
    await connection.query(insertQuery, [team_id, tr_id, team_group]);

    await connection.commit();
    res.status(201).json({ message: "Team added to tournament successfully" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding team to tournament:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Team already exists in this tournament." });
    } else if (
      error.code === "ER_NO_REFERENCED_ROW_2" &&
      error.message.includes("`tournament`")
    ) {
      return res.status(404).json({ message: "Tournament not found." });
    }
    res.status(500).json({
      message: "Failed to add team to tournament",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Select a captain for a team in a specific match
exports.selectCaptain = async (req, res) => {
  const { tr_id, team_id, player_id } = req.body;

  if (!tr_id || !team_id || !player_id) {
    return res.status(400).json({
      message: "Missing required fields (tr_id, team_id, player_id)",
    });
  }

  try {
    // First, check if player exists in team_player for this tournament
    const [[playerExists]] = await db
      .promise()
      .query(
        "SELECT 1 FROM team_player WHERE player_id = ? AND team_id = ? AND tr_id = ?",
        [player_id, team_id, tr_id]
      );

    if (!playerExists) {
      return res.status(404).json({
        message: "Player not found in this team for this tournament",
      });
    }

    // Reset any existing captain for this team in this tournament
    await db
      .promise()
      .query(
        "UPDATE team_player SET captain_flag = 'N' WHERE team_id = ? AND tr_id = ?",
        [team_id, tr_id]
      );

    // Set the new captain
    await db
      .promise()
      .query(
        "UPDATE team_player SET captain_flag = 'Y' WHERE player_id = ? AND team_id = ? AND tr_id = ?",
        [player_id, team_id, tr_id]
      );

    res.status(200).json({
      message: "Captain selected successfully",
      data: { tr_id, team_id, player_id },
    });
  } catch (error) {
    console.error("Error selecting captain:", error);
    res.status(500).json({
      message: "Failed to select captain",
      error: error.message,
    });
  }
};

// Approve a player to join a team (in a tournament context)
// The schema links players to teams via team_player for a specific tournament.
// Assuming "Approve" means adding the player to the team_player table.

// exports.approvePlayer = async (req, res) => {
//   const { tr_id, team_id, player_id } = req.params;

//   if (!tr_id || !team_id || !player_id) {
//     return res
//       .status(400)
//       .json({ message: "Missing required IDs (tr_id, team_id, player_id)" });
//   }

//   try {
//     // Check if player and team exist (optional, FK constraints handle this but good practice)
//     // Check if player is already in the team for this tournament
//     const [[existing]] = await db
//       .promise()
//       .query(
//         "SELECT 1 FROM team_player WHERE player_id = ? AND team_id = ? AND tr_id = ?",
//         [player_id, team_id, tr_id]
//       );
//     if (existing) {
//       return res.status(409).json({
//         message: "Player already approved for this team in this tournament.",
//       });
//     }

//     // Add player to the team for the tournament
//     const query =
//       "INSERT INTO team_player (player_id, team_id, tr_id) VALUES (?, ?, ?)";
//     await db.promise().query(query, [player_id, team_id, tr_id]);

//     res.status(201).json({
//       message:
//         "Player approved and added to the team for the tournament successfully",
//     });
//   } catch (error) {
//     console.error("Error approving player:", error);
//     if (error.code === "ER_NO_REFERENCED_ROW_2") {
//       // Check which foreign key failed
//       if (error.message.includes("`player`")) {
//         return res.status(404).json({ message: "Player not found." });
//       } else if (error.message.includes("`team`")) {
//         return res.status(404).json({ message: "Team not found." });
//       } else if (error.message.includes("`tournament`")) {
//         return res.status(404).json({ message: "Tournament not found." });
//       }
//     }
//     res
//       .status(500)
//       .json({ message: "Failed to approve player", error: error.message });
//   }
// };

// exports.approvePlayer = async (req, res) => {
//   const tr_id = parseInt(req.params.tr_id, 10);
//   const team_id = parseInt(req.params.team_id, 10);
//   const player_id = parseInt(req.params.player_id, 10);

//   if (!tr_id || !team_id || !player_id)
//     return res.status(400).json({ message: "Missing IDs" });

//   const conn = await db.promise().getConnection();
//   try {
//     await conn.beginTransaction();

//     /* 1 ) هل اللاعب مسجَّل أصلاً في هذه البطولة؟ */
//     const [[existing]] = await conn.query(
//       `SELECT team_id
//          FROM team_player
//         WHERE player_id = ? AND tr_id = ? FOR UPDATE`,
//       [player_id, tr_id]
//     );

//     /* 2 ) لو مسجَّل مع نفس الفريق ➜ 409 */
//     if (existing && existing.team_id === team_id) {
//       await conn.rollback();
//       return res
//         .status(409)
//         .json({ message: "Player already in this team for this tournament." });
//     }

//     /* 3 ) مسجَّل مع فريق آخر ➜ انقله */
//     if (existing) {
//       await conn.query(
//         `UPDATE team_player
//             SET team_id = ?
//           WHERE player_id = ? AND tr_id = ?`,
//         [team_id, player_id, tr_id]
//       );
//       await conn.commit();
//       return res
//         .status(200)
//         .json({
//           message: `Player moved from team ${existing.team_id} to ${team_id}.`,
//         });
//     }

//     /* 4 ) غير مسجَّل إطلاقاً ➜ أدخِله */
//     await conn.query(
//       `INSERT INTO team_player (player_id, team_id, tr_id)
//        VALUES (?, ?, ?)`,
//       [player_id, team_id, tr_id]
//     );
//     await conn.commit();
//     return res
//       .status(201)
//       .json({ message: "Player approved and added to the team." });
//   } catch (err) {
//     await conn.rollback();
//     if (err.code === "ER_NO_REFERENCED_ROW_2")
//       return res
//         .status(404)
//         .json({ message: "Invalid FK (player/team/tournament)." });
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   } finally {
//     conn.release();
//   }
// };

exports.approvePlayer = async (req, res) => {
  const tr_id = parseInt(req.params.tr_id, 10);
  const team_id = parseInt(req.params.team_id, 10);
  const player_id = parseInt(req.params.player_id, 10);

  if (!tr_id || !team_id || !player_id)
    return res.status(400).json({ message: "Missing IDs" });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    /* هل لدى اللاعب صفّ مسبق (بغضّ النظر عن البطولة أو الفريق)؟ */
    const [rows] = await conn.query(
      `SELECT team_id, tr_id
         FROM team_player
        WHERE player_id = ?       /* نحجز الصفوف القديمة */
        FOR UPDATE`,
      [player_id]
    );

    /* 1) اللاعب مسجَّل مع نفس الفريق ونفس البطولة ⇒ 409 */
    if (
      rows.length === 1 &&
      rows[0].team_id === team_id &&
      rows[0].tr_id === tr_id
    ) {
      await conn.rollback();
      return res
        .status(409)
        .json({ message: "Player already registered with this team." });
    }

    /* 2) حذف كل الصفوف القديمة (إن وُجدت) */
    if (rows.length > 0) {
      await conn.query(`DELETE FROM team_player WHERE player_id = ?`, [
        player_id,
      ]);
    }

    /* 3) إضافة الصفّ الجديد */
    await conn.query(
      `INSERT INTO team_player (player_id, team_id, tr_id)
       VALUES (?, ?, ?)`,
      [player_id, team_id, tr_id]
    );

    await conn.commit();

    const movedFrom =
      rows.length === 0
        ? null
        : ` (was in team ${rows[0].team_id}, tournament ${rows[0].tr_id})`;

    return res.status(201).json({
      message:
        "Player approved and recorded with new team/tournament" +
        (movedFrom || ""),
    });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_NO_REFERENCED_ROW_2")
      return res
        .status(404)
        .json({ message: "Invalid FK (player / team / tournament)." });

    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
};
