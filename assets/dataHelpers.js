import { sql } from "@vercel/postgres";
export async function addUser(user) {
  try {
    const result = await sql`
        INSERT INTO users (id, first_name, last_name)
        VALUES (${user.id}, ${user.first_name}, ${user.last_name})
        ON CONFLICT (id) DO NOTHING
        RETURNING *`;
    if (result.rowCount > 0) {
    //   console.log("User added", result.rows[0]);
    } else {
    //   console.log("User already exists");
    }
  } catch (error) {
    console.error("Error adding user,", error);
  }
}

export async function updateUser(id) {
  try {
    await sql`UPDATE users
  SET correct_guesses = users.correct_guesses + 1
  WHERE id = ${id}`;
    // console.log("updated");
  } catch (error) {
    console.error("Error updating user,", error);
  }
}
export async function getWords() {
  try {
    const { rows } = await sql`SELECT * FROM words
    WHERE picked = FALSE`;
    // console.log("Words: ", rows);
    const word = await rows[Math.floor(Math.random() * rows.length)];
    const result = await sql`UPDATE words
    set picked = TRUE
    WHERE word = ${word.word}`;
    return word;
  } catch (error) {
    console.error("Error getting words:", error);
  }
}

export async function resetWords() {
  try {
    const result = await sql`UPDATE words
    SET picked = FALSE
    RETURNING *`;
    // console.log("Reset words successfully");
    return result;
  } catch (err) {
    console.error("Error resetting words:", err);
  }
}
export async function getUsers() {
  try {
    const { rows } = await sql`SELECT * FROM users`;
    // console.log("Users:", rows);
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
export async function checkLeaderboard() {
  try {
    const { rows } = await sql`SELECT (first_name, correct_guesses) FROM users`;
    // console.log("Users:", rows);
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
export async function getGuesses(id) {
  try {
    const { rows } = await sql`SELECT guess_count FROM users
    WHERE id = ${id}`;
    if (rows.length > 0) {
      const guess_count = rows[0].guess_count;
    //   console.log(guess_count);
      return guess_count;
    } else {
      console.error("User not found");
      return null;
    }
  } catch (err) {
    console.error("Error getting guesses");
  }
}
export async function updateGuesses(id, newGuess) {
  try {
    const { rows } = await sql`
    UPDATE users
    SET guess_count = ${newGuess}
    WHERE id = ${id}`;
    // console.log("User Updated");
  } catch (err) {
    console.error("Error editing user guesses");
  }
}
export async function initializeTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS active_games (
        group_id BIGINT PRIMARY KEY,
        word TEXT NOT NULL,
        clue TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        group_name TEXT NOT NULL,
        identifier TEXT UNIQUE NOT NULL
      )`;

    // console.log("Active games table initialized");
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
}

// Helper functions for database operations
export async function generateIdentifier(groupName) {
  const firstWord = groupName
    .replace(/[^\w\s]/gi, "")
    .split(" ")[0]
    .toLowerCase();
  let identifier = firstWord;
  let counter = 1;

  while (true) {
    try {
      const result = await sql`
        SELECT identifier 
        FROM active_games 
        WHERE identifier = ${identifier}`;

      if (result.rows.length === 0) {
        return identifier;
      }

      identifier = `${firstWord}${counter}`;
      counter++;
    } catch (error) {
      console.error("Error generating identifier:", error);
      throw error;
    }
  }
}

export async function getActiveGame(groupId) {
  try {
    const result = await sql`
      SELECT * FROM active_games 
      WHERE group_id = ${groupId}`;
    return result.rows[0];
  } catch (error) {
    console.error("Error getting active game:", error);
    return null;
  }
}

export async function getGameByIdentifier(identifier) {
  try {
    const result = await sql`
      SELECT * FROM active_games 
      WHERE identifier = ${identifier}`;
    return result.rows[0];
  } catch (error) {
    console.error("Error getting game by identifier:", error);
    return null;
  }
}

export async function createGame(groupId, word, clue, groupName, identifier) {
  try {
    // Get the current games played count
    const { rows } = await sql`
      SELECT games_played
      FROM group_games
      WHERE group_id = ${groupId}
      AND game_date = CURRENT_DATE`;

    // console.log("Query result:", rows); // Debug log

    let currentGamesPlayed = 0;

    if (rows && rows.length > 0) {
      currentGamesPlayed = rows[0].games_played;
    }

    // console.log("Current games played:", currentGamesPlayed); // Debug log

    // Check if the group has played less than 2 games today
    if (currentGamesPlayed < 2) {
      // Insert new game into active_games table
      await sql`
        INSERT INTO active_games (group_id, word, clue, start_time, group_name, identifier)
        VALUES (${groupId}, ${word}, ${clue}, NOW(), ${groupName}, ${identifier})`;

      // Insert or update the games_played count
      await sql`
        INSERT INTO group_games (group_id, game_date, games_played)
        VALUES (${groupId}, CURRENT_DATE, 1)
        ON CONFLICT (group_id)
        DO UPDATE SET 
          games_played = CASE 
            WHEN group_games.game_date = CURRENT_DATE THEN group_games.games_played + 1
            ELSE 1
          END,
          game_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
        WHERE group_games.group_id = ${groupId}`;

      return currentGamesPlayed;
    } else {
      return false; // Group has already played 2 games today
    }
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

export async function deleteGame(groupId) {
  try {
    await sql`
      DELETE FROM active_games 
      WHERE group_id = ${groupId}`;
  } catch (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
}

export async function getAllActiveGames() {
  try {
    const result = await sql`
      SELECT * FROM active_games 
      ORDER BY start_time DESC`;
    return result.rows;
  } catch (error) {
    console.error("Error getting all active games:", error);
    return [];
  }
}
export async function resetDailyGuesses() {
  try {
    await sql`
      UPDATE users 
      SET guess_count = 3 
      WHERE TRUE`;
    // console.log("Reset all users' guesses to 3");
  } catch (error) {
    console.error("Error resetting guesses:", error);
  }
}

export async function checkAndResetGuesses() {
  try {
    const { rows } = await sql`
      SELECT last_reset 
      FROM bot_state 
      WHERE id = 1`;

    const lastReset = rows[0]?.last_reset ? new Date(rows[0].last_reset) : null;
    const now = new Date();

    if (!lastReset || lastReset.getDate() !== now.getDate()) {
      await resetDailyGuesses();
      // Clear active games on new day
      // activeGames.clear();
      await sql`
        INSERT INTO bot_state (id, last_reset) 
        VALUES (1, ${now}) 
        ON CONFLICT (id) 
        DO UPDATE SET last_reset = ${now}`;
    }
  } catch (error) {
    console.error("Error checking/resetting guesses:", error);
  }
}
