import React, { useState, useEffect } from "react";
import {
  getMatchesByTournament,
  getTopScorers,
  getRedCardedPlayers,
  getTeamComposition,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function GuestPage() {
  // State for forms
  const [matchesTrId, setMatchesTrId] = useState("");
  const [matchesSort, setMatchesSort] = useState("asc");
  const [redCardTeamId, setRedCardTeamId] = useState("");
  const [compositionTeamId, setCompositionTeamId] = useState("");

  // State for displaying data
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [redCardedPlayers, setRedCardedPlayers] = useState([]);
  const [teamComposition, setTeamComposition] = useState([]);

  // State for feedback/errors
  const [matchesMessage, setMatchesMessage] = useState("");
  const [scorersMessage, setScorersMessage] = useState("");
  const [redCardMessage, setRedCardMessage] = useState("");
  const [compositionMessage, setCompositionMessage] = useState("");

  // Fetch top scorers on component mount
  useEffect(() => {
    fetchScorers();
    // eslint-disable-next-line
  }, []);

  // Fetch top scorers function (for manual refresh)
  const fetchScorers = async () => {
    setScorersMessage("Fetching top scorers...");
    try {
      const response = await getTopScorers();
      setTopScorers(response.data);
      setScorersMessage("");
    } catch (error) {
      setScorersMessage(
        `Error fetching top scorers: ${
          error.response?.data?.message || error.message
        }`
      );
      console.error("Error fetching top scorers:", error);
    }
  };

  // Handlers for fetching data
  const handleFetchMatches = async (e) => {
    e.preventDefault();
    if (!matchesTrId) {
      setMatchesMessage("Please enter a Tournament ID.");
      setMatches([]);
      return;
    }
    setMatchesMessage("Fetching matches...");
    setMatches([]);
    try {
      const response = await getMatchesByTournament(matchesTrId, matchesSort);
      setMatches(response.data);
      setMatchesMessage(
        response.data.length === 0
          ? "No matches found for this tournament."
          : ""
      );
    } catch (error) {
      setMatchesMessage(
        `Error fetching matches: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleFetchRedCards = async (e) => {
    e.preventDefault();
    if (!redCardTeamId) {
      setRedCardMessage("Please enter a Team ID.");
      setRedCardedPlayers([]);
      return;
    }
    setRedCardMessage("Fetching red carded players...");
    setRedCardedPlayers([]);
    try {
      const response = await getRedCardedPlayers(redCardTeamId);
      setRedCardedPlayers(response.data);
      setRedCardMessage(
        response.data.length === 0
          ? "No red carded players found for this team."
          : ""
      );
    } catch (error) {
      setRedCardMessage(
        `Error fetching red cards: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for fetching team composition (only by team ID)
  const handleFetchComposition = async (e) => {
    e.preventDefault();
    setCompositionMessage("Fetching team composition...");
    setTeamComposition([]);
    try {
      const response = await getTeamComposition(compositionTeamId);
      setTeamComposition(response.data);
      setCompositionMessage(
        response.data.length === 0 ? "No composition found for this team." : ""
      );
    } catch (error) {
      setCompositionMessage(
        `Error fetching composition: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Tournament Information Center
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {/* Browse Matches Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="text-xl font-semibold text-indigo-700">
                Browse Match Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleFetchMatches}
                className="flex flex-wrap items-end gap-4 mb-6"
              >
                <div className="flex-grow">
                  <Label
                    htmlFor="matchesTrId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tournament ID
                  </Label>
                  <Input
                    id="matchesTrId"
                    type="number"
                    value={matchesTrId}
                    onChange={(e) => setMatchesTrId(e.target.value)}
                    placeholder="Enter Tournament ID"
                    required
                    className="mt-1"
                  />
                </div>
                {/* <div>
                  <Label
                    htmlFor="matchesSort"
                    className="text-sm font-medium text-gray-700"
                  >
                    Sort by Date
                  </Label>
                  <select
                    id="matchesSort"
                    value={matchesSort}
                    onChange={(e) => setMatchesSort(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div> */}
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Matches
                </Button>
              </form>
              {matchesMessage && (
                <p
                  className={`text-sm p-2 rounded ${
                    matchesMessage.startsWith("Error")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {matchesMessage}
                </p>
              )}
              {matches.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Match ID
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Venue
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team 1
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team 2
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {matches.map((match) => (
                        <TableRow
                          key={match.match_no}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {match.match_no}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(() => {
                              const d = new Date(match.play_date);
                              return isNaN(d)
                                ? match.play_date
                                : d.toLocaleDateString("en-GB");
                            })()}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {match.venue_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {match.team1_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {match.team2_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {match.team1_score} - {match.team2_score}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Goal Scorers Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-green-50 border-b border-green-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-green-700">
                Top Goal Scorers
              </CardTitle>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white ml-2"
                onClick={fetchScorers}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {scorersMessage && (
                <p
                  className={`text-sm p-2 rounded ${
                    scorersMessage.startsWith("Error")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {scorersMessage}
                </p>
              )}
              {topScorers.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Player Name
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team Name
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Goals
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {topScorers.map((scorer) => (
                        <TableRow
                          key={scorer.player_id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {scorer.player_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {scorer.team_name || "N/A"}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {scorer.total_goals}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Red Carded Players Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-xl font-semibold text-red-700">
                Red Carded Players
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleFetchRedCards}
                className="flex items-end space-x-4 mb-6"
              >
                <div className="flex-grow">
                  <Label
                    htmlFor="redCardTeamId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team ID
                  </Label>
                  <Input
                    id="redCardTeamId"
                    type="number"
                    value={redCardTeamId}
                    onChange={(e) => setRedCardTeamId(e.target.value)}
                    placeholder="Enter Team ID"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  List Players
                </Button>
              </form>
              {redCardMessage && (
                <p
                  className={`text-sm p-2 rounded ${
                    redCardMessage.startsWith("Error")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {redCardMessage}
                </p>
              )}
              {redCardedPlayers.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Player Name
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Match ID
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Red Card Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {redCardedPlayers.map((player) => (
                        <TableRow
                          key={`${player.player_id}-${player.match_no}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.player_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.match_no}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.play_date
                              ? (() => {
                                  const d = new Date(player.play_date);
                                  return isNaN(d)
                                    ? player.play_date
                                    : d.toLocaleDateString("en-GB");
                                })()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Composition Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-xl font-semibold text-blue-700">
                Team Composition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleFetchComposition}
                className="flex flex-wrap items-end gap-4 mb-6"
              >
                <div className="flex-grow">
                  <Label
                    htmlFor="compositionTeamId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Team ID
                  </Label>
                  <Input
                    id="compositionTeamId"
                    type="number"
                    value={compositionTeamId}
                    onChange={(e) => setCompositionTeamId(e.target.value)}
                    placeholder="Enter Team ID"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Show Composition
                </Button>
              </form>
              {compositionMessage && (
                <p
                  className={`text-sm p-2 rounded ${
                    compositionMessage.startsWith("Error")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {compositionMessage}
                </p>
              )}
              {teamComposition.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Extra Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {teamComposition.map((member) => (
                        <TableRow
                          key={`${member.member_id}-${member.role}-${member.member_name}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.member_name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.role}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.extra_status || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GuestPage;
