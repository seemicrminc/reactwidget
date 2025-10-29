# Edit Widget Feature Implementation

## Overview
Added complete edit functionality to the Widget Builder that:
- Fetches widget data from `/widgets/show?widget_id={id}`
- Populates the form with existing data
- Separates default fields (Required/Optional) from custom fields
- Updates widgets via `/api/v1/widgets/update`

## Key Features

### 1. Dynamic Form Population
- **Required Fields**: Default fields marked as required are shown in the Required Fields dropdown
- **Optional Fields**: Default fields marked as optional are shown in the Optional Fields dropdown
- **Custom Fields**: Custom fields (non-default) are loaded into the CustomFieldBuilder component

### 2. Field Separation Logic
Default fields include:
- Address
- Birthday
- Child Email
- Child Phone
- FaceTime ID
- Gender
- How Did You Hear About Us? (Referrer)
- Photo
- School
- Skype ID
- WeChat ID

Any field from the API's `custom_fields` array that matches these names is treated as a default field and placed in Required/Optional dropdowns. All other fields are treated as custom fields.

### 3. Update Payload Structure
When updating, the system:
1. Combines Required Fields + Optional Fields + Custom Fields into a single `custom_fields` array
2. Sets `is_required: 1` for Required Fields, `0` for Optional Fields
3. Preserves custom field types (text_single, radio, checkbox, etc.)
4. Sends proper API format with widget_id

## Usage

### In Dashboard Component
```jsx
// State for edit mode
const [editWidgetId, setEditWidgetId] = useState(null);

// Handle edit button click
const handleEditWidget = (widgetId) => {
  setEditWidgetId(widgetId);
  setActiveTab('builder');
};

// Pass to components
<WidgetBuilder onWidgetCreated={handleWidgetCreated} editWidgetId={editWidgetId} />
<WidgetList onEdit={handleEditWidget} />
```

### In WidgetList Component
```jsx
// Edit button added
<button onClick={() => onEdit && onEdit(widget.id)}>
  ✏️ Edit
</button>
```

### In WidgetBuilder Component
```jsx
// Accepts editWidgetId prop
const WidgetBuilder = ({ onWidgetCreated, editWidgetId = null }) => {
  // Automatically loads widget data when editWidgetId changes
  useEffect(() => {
    if (editWidgetId) {
      loadWidgetData(editWidgetId);
    }
  }, [editWidgetId]);
}
```

## API Integration

### GET Widget
**Endpoint**: `/widgets/show?widget_id={id}`

**Response**: Returns widget with all fields including custom_fields array

### UPDATE Widget
**Endpoint**: `/api/v1/widgets/update?widget_id={id}`

**Payload**:
```json
{
  "widget_id": 1,
  "widget_title": "Updated Title",
  "accent_color": "#25A3AF",
  "student_type": "show_both",
  "default_status": "Active",
  "send_portal_login": 1,
  "group_tag": "Tag",
  "enable_online_payment": 0,
  "enable_registration_fee": 1,
  "registration_fee_amount": 100.00,
  "registration_fee_category": "registration",
  "registration_fee_description": "Registration fee",
  "success_message": "Thank you!",
  "confirmation_email_enabled": 1,
  "confirmation_email_subject": "Confirmation",
  "confirmation_email_body": "Email body...",
  "is_active": 1,
  "custom_fields": [
    {
      "field_name": "Address",
      "field_type": "text_single",
      "hint_text": "",
      "is_required": 1,
      "collection_type": "once_per_form"
    },
    {
      "field_name": "Custom Field Name",
      "field_type": "radio",
      "field_options": ["Option 1", "Option 2"],
      "hint_text": "Select one",
      "is_required": 1,
      "collection_type": "once_per_student"
    }
  ]
}
```

## UI Changes

### Modal Title
- **Create Mode**: "New {Type} Widget"
- **Edit Mode**: "Edit {Type} Widget"

### Save Button
- **Create Mode**: "Save Widget" / "Saving..."
- **Edit Mode**: "Update Widget" / "Updating..."

### Success Message
- **Create**: "Widget created successfully!"
- **Edit**: "Widget updated successfully!"

## Testing

1. **Create a widget** with Required Fields, Optional Fields, and Custom Fields
2. **Click Edit button** from My Widgets list
3. **Verify**:
   - All form fields are populated correctly
   - Required/Optional fields appear in correct dropdowns
   - Custom fields appear in CustomFieldBuilder
   - Modal shows "Edit" instead of "New"
4. **Modify fields** and click "Update Widget"
5. **Verify** changes are saved and reflected in the widget list

## Notes

- Edit mode automatically opens the modal when editWidgetId is set
- Form resets after successful update
- Required and Optional fields remain mutually exclusive during editing
- Custom field types are preserved during update
