import React, { useState, useEffect } from 'react';
import {
  getMatchesByTournament,
  getTopScorers,
  getRedCardedPlayers,
  getTeamComposition
} from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function GuestPage() {
  // State for forms
  const [matchesTrId, setMatchesTrId] = useState('');
  const [matchesSort, setMatchesSort] = useState('asc');
  const [redCardTeamId, setRedCardTeamId] = useState('');
  const [compositionTeamId, setCompositionTeamId] = useState('');
  const [compositionTrId, setCompositionTrId] = useState('');

  // State for displaying data
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [redCardedPlayers, setRedCardedPlayers] = useState([]);
  const [teamComposition, setTeamComposition] = useState([]);

  // State for feedback/errors
  const [matchesMessage, setMatchesMessage] = useState('');
  const [scorersMessage, setScorersMessage] = useState('');
  const [redCardMessage, setRedCardMessage] = useState('');
  const [compositionMessage, setCompositionMessage] = useState('');

  // Fetch top scorers on component mount
  useEffect(() => {
    const fetchScorers = async () => {
      setScorersMessage('Fetching top scorers...');
      try {
        const response = await getTopScorers();
        setTopScorers(response.data);
        setScorersMessage(''); // Clear message on success
      } catch (error) {
        setScorersMessage(`Error fetching top scorers: ${error.response?.data?.message || error.message}`);
        console.error("Error fetching top scorers:", error);
      }
    };
    fetchScorers();
  }, []);

  // Handlers for fetching data
  const handleFetchMatches = async (e) => {
    e.preventDefault();
    // Add check: Only fetch if matchesTrId is not empty
    if (!matchesTrId) {
      setMatchesMessage('Please enter a Tournament ID.');
      setMatches([]); // Clear any previous results
      return; // Stop execution if no ID is entered
    }
    setMatchesMessage('Fetching matches...');
    setMatches([]); // Clear previous results
    try {
      const response = await getMatchesByTournament(matchesTrId, matchesSort);
      setMatches(response.data);
      setMatchesMessage(response.data.length === 0 ? 'No matches found for this tournament.' : '');
    } catch (error) {
      setMatchesMessage(`Error fetching matches: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFetchRedCards = async (e) => {
    e.preventDefault();
    // Add check: Only fetch if redCardTeamId is not empty
    if (!redCardTeamId) {
      setRedCardMessage('Please enter a Team ID.');
      setRedCardedPlayers([]); // Clear previous results
      return; // Stop execution if no ID is entered
    }
    setRedCardMessage('Fetching red carded players...');
    setRedCardedPlayers([]);
    try {
      const response = await getRedCardedPlayers(redCardTeamId);
      setRedCardedPlayers(response.data);
      setRedCardMessage(response.data.length === 0 ? 'No red carded players found for this team.' : '');
    } catch (error) {
      setRedCardMessage(`Error fetching red cards: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFetchComposition = async (e) => {
    e.preventDefault();
    setCompositionMessage('Fetching team composition...');
    setTeamComposition([]);
    try {
      const response = await getTeamComposition(compositionTeamId, compositionTrId);
      setTeamComposition(response.data);
      setCompositionMessage(response.data.length === 0 ? 'No composition found for this team in this tournament.' : '');
    } catch (error) {
      setCompositionMessage(`Error fetching composition: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Guest Functions</h2>

      {/* Browse Matches Card */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Match Results by Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchMatches} className="flex flex-wrap items-end gap-4 mb-4">
            <div className="flex-grow">
              <Label htmlFor="matchesTrId">Tournament ID</Label>
              <Input id="matchesTrId" type="number" value={matchesTrId} onChange={(e) => setMatchesTrId(e.target.value)} placeholder="Enter Tournament ID" required />
            </div>
            <div>
                <Label htmlFor="matchesSort">Sort by Date</Label>
                <select id="matchesSort" value={matchesSort} onChange={(e) => setMatchesSort(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            <Button type="submit">Browse Matches</Button>
          </form>
          {matchesMessage && <p className={`text-sm ${matchesMessage.startsWith('Error') ? 'text-red-600' : 'text-gray-600'}`}>{matchesMessage}</p>}
          {matches.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Team 1</TableHead>
                  <TableHead>Team 2</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.match_no}>
                    <TableCell>{match.match_no}</TableCell>
                    <TableCell>{new Date(match.play_date).toLocaleDateString()}</TableCell>
                    <TableCell>{match.venue_name}</TableCell>
                    <TableCell>{match.team1_name}</TableCell>
                    <TableCell>{match.team2_name}</TableCell>
                    <TableCell>{match.team1_score} - {match.team2_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top Goal Scorers Card */}
      <Card>
        <CardHeader>
          <CardTitle>Top Goal Scorers (All Tournaments)</CardTitle>
        </CardHeader>
        <CardContent>
          {scorersMessage && <p className={`text-sm ${scorersMessage.startsWith('Error') ? 'text-red-600' : 'text-gray-600'}`}>{scorersMessage}</p>}
          {topScorers.length > 0 && (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Goals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topScorers.map((scorer) => (
                  <TableRow key={scorer.player_id}>
                    <TableCell>{scorer.player_name}</TableCell>
                    <TableCell>{scorer.team_name || 'N/A'}</TableCell>
                    <TableCell>{scorer.total_goals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Red Carded Players Card */}
      <Card>
        <CardHeader>
          <CardTitle>List Red Carded Players per Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchRedCards} className="flex items-end space-x-2 mb-4">
            <div className="flex-grow">
              <Label htmlFor="redCardTeamId">Team ID</Label>
              <Input id="redCardTeamId" type="number" value={redCardTeamId} onChange={(e) => setRedCardTeamId(e.target.value)} placeholder="Enter Team ID" required />
            </div>
            <Button type="submit">List Players</Button>
          </form>
           {redCardMessage && <p className={`text-sm ${redCardMessage.startsWith('Error') ? 'text-red-600' : 'text-gray-600'}`}>{redCardMessage}</p>}
           {redCardedPlayers.length > 0 && (
             <Table>
              <TableHeader>
                 <TableRow>
                   <TableHead>Player Name</TableHead>
                   <TableHead>Match ID</TableHead>
                   <TableHead>Red Card Time</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {redCardedPlayers.map((player) => (
                   <TableRow key={`${player.player_id}-${player.match_no}`}>
                     <TableCell>{player.player_name}</TableCell>
                     <TableCell>{player.match_no}</TableCell>
                     <TableCell>{player.play_date ? new Date(player.play_date).toLocaleDateString() : 'N/A'}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>

      {/* Team Composition Card */}
      <Card>
        <CardHeader>
          <CardTitle>Show Team Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchComposition} className="flex items-end space-x-2 mb-4">
             <div className="flex-grow">
               <Label htmlFor="compositionTeamId">Team ID</Label>
               <Input id="compositionTeamId" type="number" value={compositionTeamId} onChange={(e) => setCompositionTeamId(e.target.value)} placeholder="Enter Team ID" required />
             </div>
             <div className="flex-grow">
               <Label htmlFor="compositionTrId">Tournament ID</Label>
               <Input id="compositionTrId" type="number" value={compositionTrId} onChange={(e) => setCompositionTrId(e.target.value)} placeholder="Enter Tournament ID" required />
             </div>
             <Button type="submit">Show Composition</Button>
           </form>
            {compositionMessage && <p className={`text-sm ${compositionMessage.startsWith('Error') ? 'text-red-600' : 'text-gray-600'}`}>{compositionMessage}</p>}
            {teamComposition.length > 0 && (
              <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Player Name</TableHead>
                   <TableHead>Position</TableHead>
                   <TableHead>Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {teamComposition.players && teamComposition.players.map((player) => (
                   <TableRow key={player.player_id}>
                     <TableCell>{player.name}</TableCell>
                     <TableCell>{player.position}</TableCell>
                     <TableCell>{player.jersey_no}</TableCell>
                   </TableRow>
                 ))}
                 {teamComposition.support_staff && teamComposition.support_staff.map((staff) => (
                    <TableRow key={staff.support_id}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>-</TableCell>
                    </TableRow>
                 ))}
               </TableBody>
             </Table>
            )}
        </CardContent>
      </Card>

    </div>
  );
}

export default GuestPage;

