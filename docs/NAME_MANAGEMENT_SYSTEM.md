# Name Management System Documentation

## Overview
The name management system handles user names across different persona types (KNYT and Qrypto) with support for multiple name sources (invitation, LinkedIn, custom).

## Persona-Specific Behavior

### KNYT Personas
- **Default Name Source**: `invitation` 
- **LinkedIn Integration**: When LinkedIn connects, LinkedIn names are stored but invitation names remain active
- **Conflict Detection**: Shows dialog when LinkedIn names differ from invitation names
- **User Choice**: User can choose between invitation, LinkedIn, or custom names via NameConflictDialog

### Qrypto Personas  
- **Default Name Source**: `linkedin`
- **LinkedIn Integration**: LinkedIn names are automatically applied as the active name
- **Conflict Management**: User can manually override LinkedIn names with custom or invitation names
- **Flexibility**: Users can have different names for Qrypto vs KNYT personas

## Database Schema

### user_name_preferences Table
- `user_id`: References auth user
- `persona_type`: 'knyt' | 'qrypto' 
- `name_source`: 'invitation' | 'linkedin' | 'custom'
- `invitation_first_name`, `invitation_last_name`: From invitation data
- `linkedin_first_name`, `linkedin_last_name`: From LinkedIn OAuth
- `custom_first_name`, `custom_last_name`: User-defined names

## Key Components

### NamePreferenceService
- `processLinkedInNames()`: Handles LinkedIn OAuth name processing per persona type
- `detectNameConflict()`: Determines when to show name conflict dialog
- `saveNamePreference()`: Saves user name choices and updates persona tables
- `updatePersonaNames()`: Updates the corresponding persona table with effective names

### NameConflictDialog
- Shows different messaging for KNYT vs Qrypto personas
- Defaults to appropriate name source per persona type
- Handles user selection and saves preferences

### NameManagementSection
- Displays current names and sources for each persona
- Provides edit functionality via NameConflictDialog
- Shows real-time status of name preferences

## Agent Integration
Agents address users based on their active persona's name preferences:
- Uses `PersonaContextService.determinePreferredName()`
- Respects the effective name from the user's current persona
- Different names can be used for different persona interactions

## Key Features
1. **Persona Isolation**: Each persona type has separate name preferences
2. **Source Flexibility**: Users can choose different name sources per persona
3. **Automatic Processing**: LinkedIn names are handled automatically based on persona rules
4. **Conflict Resolution**: Clear UI for resolving name conflicts
5. **Agent Integration**: Names are properly integrated with agent addressing