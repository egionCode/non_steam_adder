## ADDED Requirements

### Requirement: File Import via Dropzone
The system SHALL provide a central dropzone area on the initial screen that accepts executable (.exe) files.

#### Scenario: Drag and drop a valid executable
- **WHEN** the user drags a .exe file into the dropzone
- **THEN** the system SHALL accept the file and trigger metadata extraction

#### Scenario: Click to open file selector
- **WHEN** the user clicks on the dropzone area
- **THEN** the system SHALL open a native OS file selector filtered for executable files

### Requirement: Automatic Metadata Extraction
The system SHALL extract the game's title from the executable's binary metadata (ProductName or FileDescription).

#### Scenario: Successful metadata extraction
- **WHEN** a valid executable is selected
- **THEN** the system SHALL extract the product name and automatically populate the game title field on the next screen

#### Scenario: Fallback for missing metadata
- **WHEN** an executable with no product name metadata is selected
- **THEN** the system SHALL use the filename (without extension) as the default game title
