## ADDED Requirements

### Requirement: SteamGridDB Search
The system SHALL search for game artwork using the SteamGridDB API based on the extracted or user-provided game title.

#### Scenario: Search for images
- **WHEN** the user clicks the "Search" button after providing a game title
- **THEN** the system SHALL fetch image results from SteamGridDB for all four categories (Cover, Wide Cover, Background, Logo)

### Requirement: Artwork Gallery Selection
The system SHALL display a gallery of available images for each artwork slot to allow manual selection.

#### Scenario: Open selection modal
- **WHEN** the user clicks on an artwork slot (e.g., Cover)
- **THEN** the system SHALL display a modal gallery containing all images returned by the API for that specific category

#### Scenario: Select image from gallery
- **WHEN** the user clicks on an image within the modal gallery
- **THEN** the system SHALL update the corresponding artwork slot with the selected image and close the modal

### Requirement: Automatic Default Selection
The system SHALL automatically populate the four artwork slots with the first relevant results from the API search.

#### Scenario: Initial search results
- **WHEN** the API search returns results for a game
- **THEN** the system SHALL automatically fill the Cover, Wide Cover, Background, and Logo slots with the top result for each category
