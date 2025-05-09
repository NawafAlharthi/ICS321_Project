const express = require("express");
const mailRoutes = require("./mail");

const router = express.Router();

// Import controllers
const tournamentController = require("../controllers/tournamentController");
const guestController = require("../controllers/guestController");
const systemController = require("../controllers/systemController");

// == Tournament Admin Routes ==
// Add a new tournament
router.post("/tournaments", tournamentController.addTournament);
// Delete a tournament
router.delete("/tournaments/:id", tournamentController.deleteTournament);
// Add a team to a tournament
router.post(
  "/tournaments/:tr_id/teams",
  tournamentController.addTeamToTournament
);
// Select a captain for a team
router.post("/captain", tournamentController.selectCaptain);
// Approve a player to join a team in a tournament
router.post(
  "/tournaments/:tr_id/teams/:team_id/players/:player_id/approve",
  tournamentController.approvePlayer
);

// == Guest Routes ==
// Browse all match results of a given tournament sorted by date
router.get("/tournaments/:tr_id/matches", guestController.browseMatches);
// View top goal scorers (across all tournaments)
router.get("/scorers", guestController.getTopScorers);
// List red-carded players per team
router.get("/teams/:team_id/redcards", guestController.listRedCardedPlayers);
// Show full team compositions (players, coach, manager) for a team
router.get("/teams/:team_id/composition", guestController.getTeamComposition);

// == System Routes ==
// Login (Placeholder)
router.post("/login", systemController.login);
// Logout (Placeholder)
router.post("/logout", systemController.logout);
// Send next match reminder (mock)
router.post("/reminders", systemController.sendReminders);

router.use(mailRoutes);

module.exports = router;
