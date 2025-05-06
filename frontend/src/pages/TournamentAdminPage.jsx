import React, { useState } from 'react';
import { addTournament, deleteTournament, addTeamToTournament, approvePlayer } from '../services/api';
// Assuming Shadcn/ui components are available at these paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function TournamentAdminPage() {
  // State for forms
  const [newTournament, setNewTournament] = useState({ tr_id: '', tr_name: '', start_date: null, end_date: null });
  const [delTournamentId, setDelTournamentId] = useState('');
  const [newTeam, setNewTeam] = useState({ tr_id: '', team_id: '', team_name: '', team_group: '' });
  const [approvePlayerData, setApprovePlayerData] = useState({ tr_id: '', team_id: '', player_id: '' });

  // State for feedback/errors
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Generic input handler
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prevState => ({ ...prevState, [name]: value }));
  };

  // Specific handler for date picker
  const handleDateChange = (date, fieldName, setState) => {
    setState(prevState => ({ ...prevState, [fieldName]: date }));
  };

  const handleSubmit = async (e, action, successMsg, errorMsgPrefix, clearStateFunc) => {
    e.preventDefault();
    setMessage(`${errorMsgPrefix}...`);
    setIsError(false);
    try {
      const response = await action();
      setMessage(`Success: ${response.data.message || successMsg}`);
      if (clearStateFunc) clearStateFunc();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
      setIsError(true);
    }
  };

  return (
    // Add container, padding, and max-width for better layout
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Tournament Administration</h2>
      {message && (
        <p className={`p-2 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}

      {/* Add New Tournament Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(
              e,
              () => addTournament({
                  ...newTournament,
                  // Format dates if necessary for the backend, e.g., YYYY-MM-DD
                  start_date: newTournament.start_date?.toISOString().split('T')[0],
                  end_date: newTournament.end_date?.toISOString().split('T')[0],
              }),
              'Tournament added.',
              'Adding tournament',
              () => setNewTournament({ tr_id: '', tr_name: '', start_date: null, end_date: null })
            )}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="tr_id_add">Tournament ID</Label>
              <Input id="tr_id_add" type="number" name="tr_id" placeholder="Unique ID" value={newTournament.tr_id} onChange={(e) => handleInputChange(e, setNewTournament)} required />
            </div>
            <div>
              <Label htmlFor="tr_name_add">Tournament Name</Label>
              <Input id="tr_name_add" type="text" name="tr_name" placeholder="e.g., Champions Cup 2024" value={newTournament.tr_name} onChange={(e) => handleInputChange(e, setNewTournament)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="start_date_add">Start Date</Label>
                   <Input id="start_date_add" type="date" name="start_date" value={newTournament.start_date ? newTournament.start_date.toISOString().split('T')[0] : ''} onChange={(e) => handleDateChange(new Date(e.target.value), 'start_date', setNewTournament)} required />
              </div>
              <div>
                  <Label htmlFor="end_date_add">End Date</Label>
                   <Input id="end_date_add" type="date" name="end_date" value={newTournament.end_date ? newTournament.end_date.toISOString().split('T')[0] : ''} onChange={(e) => handleDateChange(new Date(e.target.value), 'end_date', setNewTournament)} required />
              </div>
            </div>
            <Button type="submit">Add Tournament</Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Tournament Card */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(
              e,
              () => deleteTournament(delTournamentId),
              'Tournament deleted.',
              'Deleting tournament',
              () => setDelTournamentId('')
            )}
            className="flex items-end space-x-2"
          >
            <div className="flex-grow">
              <Label htmlFor="delTournamentId">Tournament ID to Delete</Label>
              <Input id="delTournamentId" type="number" name="delTournamentId" placeholder="ID to delete" value={delTournamentId} onChange={(e) => setDelTournamentId(e.target.value)} required />
            </div>
            <Button type="submit" variant="destructive">Delete Tournament</Button>
          </form>
        </CardContent>
      </Card>

      {/* Add Team Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Team to Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => handleSubmit(
              e,
              () => addTeamToTournament(newTeam.tr_id, { team_id: newTeam.team_id, team_name: newTeam.team_name, team_group: newTeam.team_group }),
              'Team added to tournament.',
              'Adding team',
              () => setNewTeam({ tr_id: '', team_id: '', team_name: '', team_group: '' })
            )}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="tr_id_add_team">Tournament ID</Label>
              <Input id="tr_id_add_team" type="number" name="tr_id" placeholder="Tournament ID" value={newTeam.tr_id} onChange={(e) => handleInputChange(e, setNewTeam)} required />
            </div>
            <div>
              <Label htmlFor="team_id_add_team">Team ID</Label>
              <Input id="team_id_add_team" type="number" name="team_id" placeholder="Team ID" value={newTeam.team_id} onChange={(e) => handleInputChange(e, setNewTeam)} required />
            </div>
            <div>
              <Label htmlFor="team_name_add_team">Team Name (Optional if exists)</Label>
              <Input id="team_name_add_team" type="text" name="team_name" placeholder="Team Name (if new)" value={newTeam.team_name} onChange={(e) => handleInputChange(e, setNewTeam)} />
            </div>
            <div>
              <Label htmlFor="team_group_add_team">Group</Label>
              <Input id="team_group_add_team" type="text" name="team_group" placeholder="e.g., A, B" value={newTeam.team_group} onChange={(e) => handleInputChange(e, setNewTeam)} maxLength="1" required />
            </div>
            <Button type="submit">Add Team</Button>
          </form>
        </CardContent>
      </Card>

      {/* Approve Player Card */}
      <Card>
        <CardHeader>
          <CardTitle>Approve Player for Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form
             onSubmit={(e) => handleSubmit(
              e,
              () => approvePlayer(approvePlayerData.tr_id, approvePlayerData.team_id, approvePlayerData.player_id),
              'Player approved.',
              'Approving player',
              () => setApprovePlayerData({ tr_id: '', team_id: '', player_id: '' })
            )}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="tr_id_approve">Tournament ID</Label>
              <Input id="tr_id_approve" type="number" name="tr_id" placeholder="Tournament ID" value={approvePlayerData.tr_id} onChange={(e) => handleInputChange(e, setApprovePlayerData)} required />
            </div>
            <div>
              <Label htmlFor="team_id_approve">Team ID</Label>
              <Input id="team_id_approve" type="number" name="team_id" placeholder="Team ID" value={approvePlayerData.team_id} onChange={(e) => handleInputChange(e, setApprovePlayerData)} required />
            </div>
            <div>
              <Label htmlFor="player_id_approve">Player ID (KFUPM ID)</Label>
              <Input id="player_id_approve" type="number" name="player_id" placeholder="Player ID (KFUPM ID)" value={approvePlayerData.player_id} onChange={(e) => handleInputChange(e, setApprovePlayerData)} required />
            </div>
            <Button type="submit">Approve Player</Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}

export default TournamentAdminPage;

