const db = require("../config/db");

// Add a new tournament
exports.addTournament = async (req, res) => {
  const { tr_id, tr_name, start_date, end_date } = req.body;

  // Basic validation
  if (!tr_id || !tr_name || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields (tr_id, tr_name, start_date, end_date)" });
  }

  try {
    const query = "INSERT INTO tournament (tr_id, tr_name, start_date, end_date) VALUES (?, ?, ?, ?)";
    const [result] = await db.promise().query(query, [tr_id, tr_name, start_date, end_date]);
    res.status(201).json({ message: "Tournament added successfully", tournamentId: tr_id });
  } catch (error) {
    console.error("Error adding tournament:", error);
    // Handle potential duplicate entry error (UNIQUE constraint on tr_name or PK constraint on tr_id)
    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Tournament ID or Name already exists." });
    }
    res.status(500).json({ message: "Failed to add tournament", error: error.message });
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
    res.status(500).json({ message: "Failed to delete tournament", error: error.message });
  }
};

// Add a team to a tournament
exports.addTeamToTournament = async (req, res) => {
    const { tr_id } = req.params;
    const { team_id, team_name, team_group } = req.body; // Assuming team might be created here or selected

    if (!tr_id || !team_id || !team_group) {
        return res.status(400).json({ message: "Missing required fields (tr_id, team_id, team_group)" });
    }

    // We need a transaction here to ensure atomicity: create team if not exists, then add to tournament_team
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 1. Check if team exists, if not, create it (handle potential team_name uniqueness if needed)
        // For simplicity, let's assume team_id refers to an existing team for now.
        // A more robust implementation would check/create the team.
        const [teamExists] = await connection.query("SELECT team_id FROM team WHERE team_id = ?", [team_id]);
        if (teamExists.length === 0) {
            // If team_name is provided, create the team
            if (team_name) {
                await connection.query("INSERT INTO team (team_id, team_name) VALUES (?, ?)", [team_id, team_name]);
            } else {
                throw new Error(`Team with ID ${team_id} does not exist and no team_name provided to create it.`);
            }
        }

        // 2. Add team to the tournament_team table
        const insertQuery = "INSERT INTO tournament_team (team_id, tr_id, team_group) VALUES (?, ?, ?)";
        await connection.query(insertQuery, [team_id, tr_id, team_group]);

        await connection.commit();
        res.status(201).json({ message: "Team added to tournament successfully" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error adding team to tournament:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Team already exists in this tournament." });
        } else if (error.code === "ER_NO_REFERENCED_ROW_2" && error.message.includes("`tournament`")) {
             return res.status(404).json({ message: "Tournament not found." });
        }
        res.status(500).json({ message: "Failed to add team to tournament", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// Select a captain for a team in a tournament (assuming captain is selected *before* a match)
// The schema has match_captain, which links captain to a specific match.
// The requirement "Select a captain for a team" might imply a default captain for the team in the tournament,
// which isn't directly in the schema. Let's implement setting the captain for a *match* as per schema.
// If a tournament-level captain is needed, the schema would need adjustment or this logic placed elsewhere.

// For now, let's skip implementing selectCaptain here as it relates to a specific match (match_captain table)
// and doesn't fit cleanly under general tournament admin setup before matches are defined.
// We'll handle match-specific details later.

// Approve a player to join a team (in a tournament context)
// The schema links players to teams via team_player for a specific tournament.
// Assuming "Approve" means adding the player to the team_player table.
exports.approvePlayer = async (req, res) => {
    const { tr_id, team_id, player_id } = req.params;

    if (!tr_id || !team_id || !player_id) {
        return res.status(400).json({ message: "Missing required IDs (tr_id, team_id, player_id)" });
    }

    try {
        // Check if player and team exist (optional, FK constraints handle this but good practice)
        // Check if player is already in the team for this tournament
        const [[existing]] = await db.promise().query(
            "SELECT 1 FROM team_player WHERE player_id = ? AND team_id = ? AND tr_id = ?",
            [player_id, team_id, tr_id]
        );
        if (existing) {
            return res.status(409).json({ message: "Player already approved for this team in this tournament." });
        }

        // Add player to the team for the tournament
        const query = "INSERT INTO team_player (player_id, team_id, tr_id) VALUES (?, ?, ?)";
        await db.promise().query(query, [player_id, team_id, tr_id]);

        res.status(201).json({ message: "Player approved and added to the team for the tournament successfully" });

    } catch (error) {
        console.error("Error approving player:", error);
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            // Check which foreign key failed
            if (error.message.includes("`player`")) {
                return res.status(404).json({ message: "Player not found." });
            } else if (error.message.includes("`team`")) {
                return res.status(404).json({ message: "Team not found." });
            } else if (error.message.includes("`tournament`")) {
                return res.status(404).json({ message: "Tournament not found." });
            }
        }
        res.status(500).json({ message: "Failed to approve player", error: error.message });
    }
};


