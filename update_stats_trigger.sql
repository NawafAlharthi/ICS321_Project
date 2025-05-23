-- MySQL Trigger to update team points, wins, draws, losses, goals_for, goals_against in tournament_team
-- This trigger fires AFTER a new row is inserted into match_played OR an existing row is updated.

DELIMITER //

CREATE TRIGGER update_team_stats_after_match
AFTER INSERT ON match_played
FOR EACH ROW
BEGIN
    DECLARE team1_id INT;
    DECLARE team2_id INT;
    DECLARE tournament_id INT;
    DECLARE score1 INT;
    DECLARE score2 INT;
    DECLARE points1 INT DEFAULT 0;
    DECLARE points2 INT DEFAULT 0;
    DECLARE win1 INT DEFAULT 0;
    DECLARE draw1 INT DEFAULT 0;
    DECLARE loss1 INT DEFAULT 0;
    DECLARE win2 INT DEFAULT 0;
    DECLARE draw2 INT DEFAULT 0;
    DECLARE loss2 INT DEFAULT 0;

    -- Get match details from match_details table
    SET team1_id = NEW.team_id1;
    SET team2_id = NEW.team_id2;
    SELECT goal_score INTO score1 FROM match_details WHERE match_no = NEW.match_no AND team_id = team1_id LIMIT 1;
    SELECT goal_score INTO score2 FROM match_details WHERE match_no = NEW.match_no AND team_id = team2_id LIMIT 1;

    SELECT tr_id INTO tournament_id FROM tournament_team WHERE team_id = team1_id LIMIT 1;

    IF score1 IS NOT NULL AND score2 IS NOT NULL THEN
        IF score1 > score2 THEN
            SET points1 = 3;
            SET points2 = 0;
            SET win1 = 1;
            SET loss2 = 1;
        ELSEIF score1 < score2 THEN
            SET points1 = 0;
            SET points2 = 3;
            SET loss1 = 1;
            SET win2 = 1;
        ELSE
            SET points1 = 1;
            SET points2 = 1;
            SET draw1 = 1;
            SET draw2 = 1;
        END IF;

        UPDATE tournament_team
        SET
            points = points + points1,
            wins = wins + win1,
            draws = draws + draw1,
            losses = losses + loss1,
            goals_for = goals_for + score1,
            goals_against = goals_against + score2
        WHERE team_id = team1_id AND tr_id = tournament_id;

        UPDATE tournament_team
        SET
            points = points + points2,
            wins = wins + win2,
            draws = draws + draw2,
            losses = losses + loss2,
            goals_for = goals_for + score2,
            goals_against = goals_against + score1
        WHERE team_id = team2_id AND tr_id = tournament_id;
    END IF;
END; //

-- We might also need a trigger for AFTER UPDATE if scores can be corrected later.
-- This trigger assumes scores are updated correctly in one go.
-- For simplicity, let's create a similar trigger for UPDATE.

CREATE TRIGGER update_team_stats_after_match_update
AFTER UPDATE ON match_played
FOR EACH ROW
BEGIN
    DECLARE team1_id INT;
    DECLARE team2_id INT;
    DECLARE tournament_id INT;
    DECLARE old_score1 INT;
    DECLARE old_score2 INT;
    DECLARE new_score1 INT;
    DECLARE new_score2 INT;
    DECLARE old_points1 INT DEFAULT 0;
    DECLARE old_points2 INT DEFAULT 0;
    DECLARE old_win1 INT DEFAULT 0;
    DECLARE old_draw1 INT DEFAULT 0;
    DECLARE old_loss1 INT DEFAULT 0;
    DECLARE old_win2 INT DEFAULT 0;
    DECLARE old_draw2 INT DEFAULT 0;
    DECLARE old_loss2 INT DEFAULT 0;
    DECLARE new_points1 INT DEFAULT 0;
    DECLARE new_points2 INT DEFAULT 0;
    DECLARE new_win1 INT DEFAULT 0;
    DECLARE new_draw1 INT DEFAULT 0;
    DECLARE new_loss1 INT DEFAULT 0;
    DECLARE new_win2 INT DEFAULT 0;
    DECLARE new_draw2 INT DEFAULT 0;
    DECLARE new_loss2 INT DEFAULT 0;

    SET team1_id = NEW.team_id1;
    SET team2_id = NEW.team_id2;
    SELECT goal_score INTO old_score1 FROM match_details WHERE match_no = OLD.match_no AND team_id = team1_id LIMIT 1;
    SELECT goal_score INTO old_score2 FROM match_details WHERE match_no = OLD.match_no AND team_id = team2_id LIMIT 1;
    SELECT goal_score INTO new_score1 FROM match_details WHERE match_no = NEW.match_no AND team_id = team1_id LIMIT 1;
    SELECT goal_score INTO new_score2 FROM match_details WHERE match_no = NEW.match_no AND team_id = team2_id LIMIT 1;

    IF (old_score1 <> new_score1 OR old_score2 <> new_score2) AND new_score1 IS NOT NULL AND new_score2 IS NOT NULL THEN
        SELECT tr_id INTO tournament_id FROM tournament_team WHERE team_id = team1_id LIMIT 1;

        IF old_score1 IS NOT NULL AND old_score2 IS NOT NULL THEN
            IF old_score1 > old_score2 THEN SET old_points1 = 3; SET old_win1 = 1; SET old_loss2 = 1;
            ELSEIF old_score1 < old_score2 THEN SET old_points2 = 3; SET old_loss1 = 1; SET old_win2 = 1;
            ELSE SET old_points1 = 1; SET old_points2 = 1; SET old_draw1 = 1; SET old_draw2 = 1;
            END IF;
        END IF;

        IF new_score1 > new_score2 THEN SET new_points1 = 3; SET new_win1 = 1; SET new_loss2 = 1;
        ELSEIF new_score1 < new_score2 THEN SET new_points2 = 3; SET new_loss1 = 1; SET new_win2 = 1;
        ELSE SET new_points1 = 1; SET new_points2 = 1; SET new_draw1 = 1; SET new_draw2 = 1;
        END IF;

        UPDATE tournament_team
        SET
            points = points - old_points1 + new_points1,
            wins = wins - old_win1 + new_win1,
            draws = draws - old_draw1 + new_draw1,
            losses = losses - old_loss1 + new_loss1,
            goals_for = goals_for - IFNULL(old_score1, 0) + new_score1,
            goals_against = goals_against - IFNULL(old_score2, 0) + new_score2
        WHERE team_id = team1_id AND tr_id = tournament_id;

        UPDATE tournament_team
        SET
            points = points - old_points2 + new_points2,
            wins = wins - old_win2 + new_win2,
            draws = draws - old_draw2 + new_draw2,
            losses = losses - old_loss2 + new_loss2,
            goals_for = goals_for - IFNULL(old_score2, 0) + new_score2,
            goals_against = goals_against - IFNULL(old_score1, 0) + new_score1
        WHERE team_id = team2_id AND tr_id = tournament_id;
    END IF;
END; //

DELIMITER ;

