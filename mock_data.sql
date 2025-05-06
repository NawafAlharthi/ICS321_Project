-- Mock Data for Soccer@KFUPM Application

-- Add some persons (potential players/support staff)
-- Assuming KFUPM IDs are numeric
INSERT INTO person (kfupm_id, name, date_of_birth) VALUES
(20201111, 'Ahmed Ali', '2002-03-15'),
(20202222, 'Mohammed Khan', '2001-07-22'),
(20213333, 'Faisal Saad', '2003-01-10'),
(20214444, 'Omar Hassan', '2002-11-05'),
(20195555, 'Khalid Fahd', '2000-05-20'),
(20196666, 'Yusuf Ibrahim', '2001-09-12'),
(20227777, 'Abdullah Saleh', '2004-02-28'),
(20228888, 'Hassan Jamal', '2003-06-18'),
(1001, 'Coach Majid', '1985-04-01'), -- Support Staff
(1002, 'Manager Saleh', '1980-10-10'); -- Support Staff

-- Add playing positions (if not already populated by DDL)
-- Assuming DDL didn't populate these
INSERT IGNORE INTO playing_position (position_id, position_desc) VALUES
("GK", "Goalkeeper"),
("DF", "Defender"),
("MF", "Midfielder"),
("FW", "Forward");

-- Add support roles (if not already populated by DDL)
-- Assuming DDL didn't populate these
INSERT IGNORE INTO support_role (support_type, support_desc) VALUES
("C", "Coach"),
("M", "Manager");

-- Add some players
INSERT INTO player (player_id, jersey_no, position_to_play) VALUES
(20201111, 10, 'MF'),
(20202222, 7, 'FW'),
(20213333, 5, 'DF'),
(20214444, 1, 'GK'),
(20195555, 9, 'FW'),
(20196666, 4, 'DF'),
(20227777, 8, 'MF'),
(20228888, 11, 'FW');

-- Add a tournament
INSERT INTO tournament (tr_id, tr_name, start_date, end_date) VALUES
(1, 'KFUPM Champions League 2025', '2025-06-01', '2025-06-30');

-- Add some teams
INSERT INTO team (team_id, team_name) VALUES
(101, 'Building 59ers'),
(102, 'Jurf Eagles'),
(103, 'Library Lions'),
(104, 'Admin Avengers');

-- Add teams to the tournament (Rely on default values for stats)
INSERT INTO tournament_team (team_id, tr_id, team_group) VALUES
(101, 1, 'A'),
(102, 1, 'A'),
(103, 1, 'B'),
(104, 1, 'B');

-- Add players to teams for the tournament
-- Team 101
INSERT INTO team_player (player_id, team_id, tr_id) VALUES
(20201111, 101, 1),
(20213333, 101, 1);
-- Team 102
INSERT INTO team_player (player_id, team_id, tr_id) VALUES
(20202222, 102, 1),
(20214444, 102, 1);
-- Team 103
INSERT INTO team_player (player_id, team_id, tr_id) VALUES
(20195555, 103, 1),
(20227777, 103, 1);
-- Team 104
INSERT INTO team_player (player_id, team_id, tr_id) VALUES
(20196666, 104, 1),
(20228888, 104, 1);

-- Add support staff to teams for the tournament
INSERT INTO team_support (support_id, team_id, tr_id, support_type) VALUES
(1001, 101, 1, 'C'), -- Coach Majid for Team 101
(1002, 102, 1, 'M'); -- Manager Saleh for Team 102

-- Add a venue (Corrected to match schema)
INSERT INTO venue (venue_id, venue_name, venue_status, venue_capacity) VALUES
(501, 'KFUPM Stadium', 'Y', 1000);

-- Add a match result (this should trigger the points update)
INSERT INTO match_played (match_no, play_stage, play_date, team_id1, team_id2, team1_score, team2_score, venue_id, decided_by, player_of_match)
VALUES (1001, 'Group A', '2025-06-05', 101, 102, 2, 1, 501, 'N', 20201111);

-- Add another match result (draw)
INSERT INTO match_played (match_no, play_stage, play_date, team_id1, team_id2, team1_score, team2_score, venue_id, decided_by)
VALUES (1002, 'Group B', '2025-06-06', 103, 104, 1, 1, 501, 'N');

-- Add goal details for the first match (Match 1001, Stage G)
INSERT INTO goal_details (match_no, team_id, player_id, goal_time, goal_type, play_stage, goal_schedule, goal_half) VALUES
(1001, 101, 20201111, 25, 'N', 'G', 'NT', 1), -- Ahmed Ali scores for Team 101 in 1st half
(1001, 101, 20201111, 60, 'N', 'G', 'NT', 2), -- Ahmed Ali scores again for Team 101 in 2nd half
(1001, 102, 20202222, 75, 'N', 'G', 'NT', 2); -- Mohammed Khan scores for Team 102 in 2nd half

-- Add goal details for the second match (Match 1002, Stage G)
INSERT INTO goal_details (match_no, team_id, player_id, goal_time, goal_type, play_stage, goal_schedule, goal_half) VALUES
(1002, 103, 20195555, 40, 'N', 'G', 'NT', 1), -- Khalid Fahd scores for Team 103 in 1st half
(1002, 104, 20228888, 80, 'N', 'G', 'NT', 2); -- Hassan Jamal scores for Team 104 in 2nd half

-- Add a booking (red card)
INSERT INTO player_booked (match_no, team_id, player_id, booking_time, card_type, play_schedule, play_half) VALUES
(1001, 102, 20214444, 85, 'R', 'NT', 2); -- Goalkeeper from Team 102 gets a red card in 2nd half normal time


