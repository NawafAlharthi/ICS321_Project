const db = require("../config/db");

// Browse all match results of a given tournament sorted by date
exports.browseMatches = async (req, res) => {
    const { tr_id } = req.params;
    const { sort_by_date } = req.query; // Optional query param, assume 'asc' or 'desc'

    if (!tr_id) {
        return res.status(400).json({ message: "Tournament ID (tr_id) is required in the path." });
    }

    try {
        let orderByClause = "ORDER BY mp.play_date ASC"; // Default sort
        if (sort_by_date && sort_by_date.toLowerCase() === 'desc') {
            orderByClause = "ORDER BY mp.play_date DESC";
        }

        // Fetch match details along with team names
        const query = `
            SELECT
                mp.match_no,
                mp.play_stage,
                mp.play_date,
                t1.team_name AS team1_name,
                t2.team_name AS team2_name,
                mp.team1_score,
                mp.team2_score,
                mp.decided_by,
                v.venue_name,
                mp.audience,
                p.name AS player_of_match_name
            FROM match_played mp
            JOIN team t1 ON mp.team_id1 = t1.team_id
            JOIN team t2 ON mp.team_id2 = t2.team_id
            JOIN venue v ON mp.venue_id = v.venue_id
            LEFT JOIN player pl ON mp.player_of_match = pl.player_id
            LEFT JOIN person p ON pl.player_id = p.kfupm_id
            WHERE EXISTS (
                SELECT 1 FROM tournament_team tt WHERE (tt.team_id = mp.team_id1 OR tt.team_id = mp.team_id2) AND tt.tr_id = ?
            )
            ${orderByClause};
        `;
        // Note: The WHERE clause assumes matches belong to a tournament if at least one participating team is in that tournament.
        // A direct tr_id FK in match_played would be cleaner if matches are strictly tied to one tournament.

        const [matches] = await db.promise().query(query, [tr_id]);

        if (matches.length === 0) {
            // Check if tournament exists but has no matches, or if tournament ID is invalid
            const [[tournamentExists]] = await db.promise().query("SELECT 1 FROM tournament WHERE tr_id = ?", [tr_id]);
            if (!tournamentExists) {
                return res.status(404).json({ message: "Tournament not found." });
            }
            return res.status(200).json([]); // Tournament exists, but no matches found
        }

        res.status(200).json(matches);
    } catch (error) {
        console.error("Error browsing matches:", error);
        res.status(500).json({ message: "Failed to retrieve matches", error: error.message });
    }
};

// View top goal scorers (across all tournaments)
exports.getTopScorers = async (req, res) => {
    try {
        // Query to count goals per player (excluding own goals) and join with person details
        const query = `
            SELECT
                gd.player_id,
                p.name AS player_name,
                COUNT(gd.goal_id) AS total_goals
            FROM goal_details gd
            JOIN person p ON gd.player_id = p.kfupm_id
            WHERE gd.goal_type != 'O' -- Exclude Own Goals
            GROUP BY gd.player_id, p.name
            ORDER BY total_goals DESC
            LIMIT 10; -- Limit to top 10 scorers, adjust as needed
        `;

        const [scorers] = await db.promise().query(query);
        res.status(200).json(scorers);
    } catch (error) {
        console.error("Error getting top scorers:", error);
        res.status(500).json({ message: "Failed to retrieve top scorers", error: error.message });
    }
};

// List red-carded players per team (in a specific tournament context?)
// Requirement: "List red-carded players per team"
// Interpretation: For a given team, list players who received red cards in any match.
// Let's assume team_id is provided.
exports.listRedCardedPlayers = async (req, res) => {
    const { team_id } = req.params;

    if (!team_id) {
        return res.status(400).json({ message: "Team ID is required in the path." });
    }

    try {
        // Check if team exists
        const [[teamExists]] = await db.promise().query("SELECT 1 FROM team WHERE team_id = ?", [team_id]);
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
            WHERE pb.team_id = ? AND pb.card_type = 'R'
            ORDER BY mp.play_date DESC, p.name ASC;
        `;

        const [redCardedPlayers] = await db.promise().query(query, [team_id]);
        res.status(200).json(redCardedPlayers);
    } catch (error) {
        console.error("Error listing red-carded players:", error);
        res.status(500).json({ message: "Failed to retrieve red-carded players", error: error.message });
    }
};

// Show full team compositions (players, captain, coach, manager)
// Interpretation: For a given team_id and tr_id, show all associated people and their roles.
exports.getTeamComposition = async (req, res) => {
    const { team_id } = req.params;
    const { tr_id } = req.query; // Tournament ID is crucial here

    if (!team_id || !tr_id) {
        return res.status(400).json({ message: "Team ID (in path) and Tournament ID (tr_id in query) are required." });
    }

    try {
        // Check if team exists in the tournament
        const [[teamInTournament]] = await db.promise().query(
            "SELECT t.team_name FROM tournament_team tt JOIN team t ON tt.team_id = t.team_id WHERE tt.team_id = ? AND tt.tr_id = ?",
            [team_id, tr_id]
        );
        if (!teamInTournament) {
            return res.status(404).json({ message: "Team not found in the specified tournament." });
        }

        // Fetch players
        const playerQuery = `
            SELECT
                p.kfupm_id AS player_id,
                p.name,
                pl.jersey_no,
                pp.position_desc AS position
            FROM team_player tp
            JOIN player pl ON tp.player_id = pl.player_id
            JOIN person p ON pl.player_id = p.kfupm_id
            JOIN playing_position pp ON pl.position_to_play = pp.position_id
            WHERE tp.team_id = ? AND tp.tr_id = ?
            ORDER BY pl.jersey_no;
        `;
        const [players] = await db.promise().query(playerQuery, [team_id, tr_id]);

        // Fetch support staff (Coach, Manager, etc.)
        const supportQuery = `
            SELECT
                p.kfupm_id AS support_id,
                p.name,
                sr.support_desc AS role
            FROM team_support ts
            JOIN person p ON ts.support_id = p.kfupm_id
            JOIN support_role sr ON ts.support_type = sr.support_type
            WHERE ts.team_id = ? AND ts.tr_id = ?;
        `;
        const [supportStaff] = await db.promise().query(supportQuery, [team_id, tr_id]);

        // Note: The schema doesn't have a single 'captain' for the team/tournament.
        // It has match_captain. We cannot reliably show a single team captain here.
        // We could show captains from recent matches, but that's an interpretation.

        res.status(200).json({
            team_id: team_id,
            team_name: teamInTournament.team_name,
            tournament_id: tr_id,
            players: players,
            support_staff: supportStaff
            // Captain info omitted due to schema structure
        });

    } catch (error) {
        console.error("Error getting team composition:", error);
        res.status(500).json({ message: "Failed to retrieve team composition", error: error.message });
    }
};

