## ADDED Requirements

### Requirement: Steam Shortcuts Modification
The system SHALL inject the new game entry into the user's `shortcuts.vdf` file.

#### Scenario: Add game to VDF
- **WHEN** the user confirms the addition of the game
- **THEN** the system SHALL parse the existing `shortcuts.vdf`, append the new game with its correct non-Steam AppID, and save the file back to disk

### Requirement: Artwork Download and Storage
The system SHALL download the selected artwork and store it in Steam's `userdata/<steam_id>/config/grid` directory.

#### Scenario: Save images to grid folder
- **WHEN** the game is added to Steam
- **THEN** the system SHALL download the four selected images and save them using the required naming convention (`<appid>p.png`, `<appid>_hero.png`, `<appid>_logo.png`, and `<appid>.png` for wide cover)

### Requirement: Success Feedback
The system SHALL provide visual feedback upon successful completion of the process.

#### Scenario: Successful addition
- **WHEN** all files (VDF and images) are successfully saved
- **THEN** the system SHALL display a success alert and navigate the user back to the initial import screen
