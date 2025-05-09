import React, { useState, useEffect } from "react"; // Add useEffect here

import {
  addTournament,
  deleteTournament,
  addTeamToTournament,
  approvePlayer,
  selectCaptain,
  sendReminders,
  getAllTeams,
} from "../services/api";
// Assuming Shadcn/ui components are available at these paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// SectionCard component for beautiful sectioned cards
const SectionCard = ({ icon, title, children, color = "indigo" }) => (
  <Card
    className={`bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden`}
  >
    <CardHeader className={`bg-${color}-50 border-b border-${color}-100`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <CardTitle className={`text-xl font-semibold text-${color}-700`}>
          {title}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

function TournamentAdminPage() {
  // State for forms
  const [newTournament, setNewTournament] = useState({
    tr_id: "",
    tr_name: "",
    start_date: null,
    end_date: null,
  });
  const [delTournamentId, setDelTournamentId] = useState("");
  const [newTeam, setNewTeam] = useState({
    tr_id: "",
    team_id: "",
    team_name: "",
    team_group: "",
  });
  const [approvePlayerData, setApprovePlayerData] = useState({
    tr_id: "",
    team_id: "",
    player_id: "",
  });
  const [captainData, setCaptainData] = useState({
    tr_id: "",
    team_id: "",
    player_id: "",
  });
  const [reminderData, setReminderData] = useState({ team_id: "", tr_id: "" });

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await getAllTeams();
        setTeams(response.data);
      } catch (err) {
        console.error("Failed to load teams", err);
      }
    }
    fetchTeams();
  }, []);

  // State for feedback/errors (per section)
  const [addTournamentMsg, setAddTournamentMsg] = useState("");
  const [addTournamentError, setAddTournamentError] = useState(false);
  const [deleteTournamentMsg, setDeleteTournamentMsg] = useState("");
  const [deleteTournamentError, setDeleteTournamentError] = useState(false);
  const [addTeamMsg, setAddTeamMsg] = useState("");
  const [addTeamError, setAddTeamError] = useState(false);
  const [approvePlayerMsg, setApprovePlayerMsg] = useState("");
  const [approvePlayerError, setApprovePlayerError] = useState(false);
  const [selectCaptainMsg, setSelectCaptainMsg] = useState("");
  const [selectCaptainError, setSelectCaptainError] = useState(false);
  const [reminderMsg, setReminderMsg] = useState("");
  const [reminderError, setReminderError] = useState(false);

  // Generic input handler
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  // Specific handler for date picker
  const handleDateChange = (date, fieldName, setState) => {
    setState((prevState) => ({ ...prevState, [fieldName]: date }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Tournament Administration
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {/* Add New Tournament Card */}
          <SectionCard icon="🏆" title="Add New Tournament" color="indigo">
            {addTournamentMsg && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  addTournamentError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {addTournamentMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddTournamentMsg("");
                setAddTournamentError(false);
                try {
                  const response = await addTournament({
                    ...newTournament,
                    start_date: newTournament.start_date
                      ?.toISOString()
                      .split("T")[0],
                    end_date: newTournament.end_date
                      ?.toISOString()
                      .split("T")[0],
                  });
                  setAddTournamentMsg(
                    `Success: ${
                      response.data.message || "Tournament added successfully."
                    }`
                  );
                  setAddTournamentError(false);
                  setNewTournament({
                    tr_id: "",
                    tr_name: "",
                    start_date: null,
                    end_date: null,
                  });
                } catch (error) {
                  setAddTournamentMsg(
                    `Error: ${error.response?.data?.message || error.message}`
                  );
                  setAddTournamentError(true);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="tr_id_add"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament ID
                  </Label>
                  <Input
                    id="tr_id_add"
                    type="number"
                    name="tr_id"
                    placeholder="Enter unique ID"
                    value={newTournament.tr_id}
                    onChange={(e) => handleInputChange(e, setNewTournament)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="tr_name_add"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament Name
                  </Label>
                  <Input
                    id="tr_name_add"
                    type="text"
                    name="tr_name"
                    placeholder="e.g., Champions Cup 2024"
                    value={newTournament.tr_name}
                    onChange={(e) => handleInputChange(e, setNewTournament)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="start_date_add"
                    className="text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </Label>
                  <Input
                    id="start_date_add"
                    type="date"
                    name="start_date"
                    value={
                      newTournament.start_date
                        ? newTournament.start_date.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleDateChange(
                        new Date(e.target.value),
                        "start_date",
                        setNewTournament
                      )
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="end_date_add"
                    className="text-sm font-medium text-gray-700"
                  >
                    End Date
                  </Label>
                  <Input
                    id="end_date_add"
                    type="date"
                    name="end_date"
                    value={
                      newTournament.end_date
                        ? newTournament.end_date.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleDateChange(
                        new Date(e.target.value),
                        "end_date",
                        setNewTournament
                      )
                    }
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Add Tournament
              </Button>
            </form>
          </SectionCard>

          {/* Delete Tournament Card */}
          <SectionCard icon="🗑" title="Delete Tournament" color="red">
            {deleteTournamentMsg && (
              <div
                className={`p-2 rounded mb-4 text-center ${
                  deleteTournamentError
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {deleteTournamentMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setDeleteTournamentMsg("");
                setDeleteTournamentError(false);
                try {
                  const response = await deleteTournament(delTournamentId);
                  setDeleteTournamentMsg("Tournament deleted successfully!");
                  setDeleteTournamentError(false);
                  setDelTournamentId("");
                } catch (error) {
                  setDeleteTournamentMsg(
                    `Error tournament has not been deleted ${
                      error.response?.data?.message || error.message
                    }`
                  );
                  setDeleteTournamentError(true);
                }
              }}
              className="space-y-6"
            >
              <div>
                <Label
                  htmlFor="delTournamentId"
                  className="text-sm font-medium text-gray-700"
                >
                  Tournament ID to Delete
                </Label>
                <Input
                  id="delTournamentId"
                  type="number"
                  name="delTournamentId"
                  placeholder="Enter tournament ID to delete"
                  value={delTournamentId}
                  onChange={(e) => setDelTournamentId(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Delete Tournament
              </Button>
            </form>
          </SectionCard>

          {/* Add Team Card */}
          <SectionCard icon="👥" title="Add Team to Tournament" color="blue">
            {addTeamMsg && (
              <div
                className={`p-2 rounded mb-4 text-center ${
                  addTeamError
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {addTeamMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddTeamMsg("");
                setAddTeamError(false);
                try {
                  const response = await addTeamToTournament(newTeam.tr_id, {
                    team_id: newTeam.team_id,
                    team_name: newTeam.team_name,
                    team_group: newTeam.team_group,
                  });
                  setAddTeamMsg("Team added successfully!");
                  setAddTeamError(false);
                  setNewTeam({
                    tr_id: "",
                    team_id: "",
                    team_name: "",
                    team_group: "",
                  });
                } catch (error) {
                  setAddTeamMsg(
                    `Error in adding the team sorry ${
                      error.response?.data?.message || error.message
                    }`
                  );
                  setAddTeamError(true);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="tr_id_team"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament ID
                  </Label>
                  <Input
                    id="tr_id_team"
                    type="number"
                    name="tr_id"
                    placeholder="Enter tournament ID"
                    value={newTeam.tr_id}
                    onChange={(e) => handleInputChange(e, setNewTeam)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="team_id"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team ID
                  </Label>
                  <Input
                    id="team_id"
                    type="number"
                    name="team_id"
                    placeholder="Enter team ID"
                    value={newTeam.team_id}
                    onChange={(e) => handleInputChange(e, setNewTeam)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="team_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team Name
                  </Label>
                  <Input
                    id="team_name"
                    type="text"
                    name="team_name"
                    placeholder="Enter team name"
                    value={newTeam.team_name}
                    onChange={(e) => handleInputChange(e, setNewTeam)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="team_group"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team Group
                  </Label>
                  <Input
                    id="team_group"
                    type="text"
                    name="team_group"
                    placeholder="Enter team group"
                    value={newTeam.team_group}
                    onChange={(e) => handleInputChange(e, setNewTeam)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Team
              </Button>
            </form>
          </SectionCard>

          {/* Approve Player Card */}
          <SectionCard icon="✅" title="Approve Player" color="green">
            {approvePlayerMsg && (
              <div
                className={`p-2 rounded mb-4 text-center ${
                  approvePlayerError
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {approvePlayerMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setApprovePlayerMsg("");
                setApprovePlayerError(false);
                try {
                  await approvePlayer(
                    approvePlayerData.tr_id,
                    approvePlayerData.team_id,
                    approvePlayerData.player_id
                  );
                  setApprovePlayerMsg("Player approved successfully!");
                  setApprovePlayerError(false);
                  setApprovePlayerData({
                    tr_id: "",
                    team_id: "",
                    player_id: "",
                  });
                } catch (error) {
                  setApprovePlayerMsg(
                    `Error while approving the player sorry ${
                      error.response?.data?.message || error.message
                    }`
                  );
                  setApprovePlayerError(true);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="tr_id_approve"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament ID
                  </Label>
                  <Input
                    id="tr_id_approve"
                    type="number"
                    name="tr_id"
                    placeholder="Enter tournament ID"
                    value={approvePlayerData.tr_id}
                    onChange={(e) => handleInputChange(e, setApprovePlayerData)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="team_id_approve"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team ID
                  </Label>
                  <Input
                    id="team_id_approve"
                    type="number"
                    name="team_id"
                    placeholder="Enter team ID"
                    value={approvePlayerData.team_id}
                    onChange={(e) => handleInputChange(e, setApprovePlayerData)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="player_id_approve"
                    className="text-sm font-medium text-gray-700"
                  >
                    Player ID
                  </Label>
                  <Input
                    id="player_id_approve"
                    type="number"
                    name="player_id"
                    placeholder="Enter player ID"
                    value={approvePlayerData.player_id}
                    onChange={(e) => handleInputChange(e, setApprovePlayerData)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Approve Player
              </Button>
            </form>
          </SectionCard>

          {/* Select Captain Card */}
          <SectionCard icon="👑" title="Select Team Captain" color="purple">
            {selectCaptainMsg && (
              <div
                className={`p-2 rounded mb-4 text-center ${
                  selectCaptainError
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {selectCaptainMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSelectCaptainMsg("");
                setSelectCaptainError(false);
                try {
                  await selectCaptain(
                    captainData.tr_id,
                    captainData.team_id,
                    captainData.player_id
                  );
                  setSelectCaptainMsg("Captain selected successfully!");
                  setSelectCaptainError(false);
                  setCaptainData({ tr_id: "", team_id: "", player_id: "" });
                } catch (error) {
                  setSelectCaptainMsg(
                    `Error while selecting the captin ${
                      error.response?.data?.message || error.message
                    }`
                  );
                  setSelectCaptainError(true);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tr_id_captain">Tournament ID</Label>
                  <Input
                    id="tr_id_captain"
                    name="tr_id"
                    type="number"
                    value={captainData.tr_id}
                    onChange={(e) => handleInputChange(e, setCaptainData)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team_id_captain">Team ID</Label>
                  <Input
                    id="team_id_captain"
                    name="team_id"
                    type="number"
                    value={captainData.team_id}
                    onChange={(e) => handleInputChange(e, setCaptainData)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="player_id_captain">Captain Player ID</Label>
                <Input
                  id="player_id_captain"
                  name="player_id"
                  type="number"
                  value={captainData.player_id}
                  onChange={(e) => handleInputChange(e, setCaptainData)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Select Captain
              </Button>
            </form>
          </SectionCard>

          {/* Send Reminders Card */}
          {/* <SectionCard icon="📢" title="Send Reminders" color="yellow">
            {reminderMsg && (
              <div
                className={`p-2 rounded mb-4 text-center ${
                  reminderError
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {reminderMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setReminderMsg("");
                setReminderError(false);
                try {
                  await sendReminders(reminderData);
                  setReminderMsg("Reminders sent successfully.");
                  setReminderError(false);
                  setReminderData({ team_id: "", tr_id: "" });
                } catch (error) {
                  setReminderMsg(
                    `Error sending reminders: ${
                      error.response?.data?.message || error.message
                    }`
                  );
                  setReminderError(true);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="tr_id_reminder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament ID
                  </Label>
                  <Input
                    id="tr_id_reminder"
                    type="number"
                    name="tr_id"
                    placeholder="Enter tournament ID"
                    value={reminderData.tr_id}
                    onChange={(e) => handleInputChange(e, setReminderData)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="team_id_reminder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team ID
                  </Label>
                  <Input
                    id="team_id_reminder"
                    type="number"
                    name="team_id"
                    placeholder="Enter team ID"
                    value={reminderData.team_id}
                    onChange={(e) => handleInputChange(e, setReminderData)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Send Reminders
              </Button>
            </form>
          </SectionCard> */}

          <SectionCard icon="📧" title="Send Match Reminder" color="blue">
            {reminderMsg && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  reminderError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {reminderMsg}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setReminderMsg("");
                setReminderError(false);
                try {
                  setReminderMsg("");
                  setReminderError(false);

                  const res = await sendReminders(selectedTeamId); // يستدعي من api.js

                  const msg = res.data;
                  if (msg.includes("No upcoming matches")) {
                    setReminderMsg(msg);
                  } else {
                    setReminderMsg("Success: Reminder sent!");
                  }
                } catch (err) {
                  setReminderMsg(
                    "Error: " + (err.response?.data?.message || err.message)
                  );
                  setReminderError(true);
                }
              }}
              className="space-y-6"
            >
              <div>
                <Label
                  htmlFor="teamSelect"
                  className="text-sm font-medium text-gray-700"
                >
                  Select Team
                </Label>
                <select
                  id="teamSelect"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                >
                  <option value="">Choose a team</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Send Reminder
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default TournamentAdminPage;
