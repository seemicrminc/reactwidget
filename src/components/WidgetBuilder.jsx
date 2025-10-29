import React, { useState, useRef, useEffect } from "react";
import { widgetAPI } from "../services/api";
import CustomFieldBuilder from "./CustomFieldBuilder";

const WidgetBuilder = ({ onWidgetCreated, editWidgetId = null }) => {
  const [activeTab, setActiveTab] = useState("signup");
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [websiteUrl, setWebsiteUrl] = useState("www.studykro.com");
  const [showRequiredDropdown, setShowRequiredDropdown] = useState(false);
  const [showOptionalDropdown, setShowOptionalDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWidgetId, setCurrentWidgetId] = useState(null);
  const requiredDropdownRef = useRef(null);
  const optionalDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    widget_type: "signup",
    widget_title: "Sign-Up",
    accent_color: "#587087",
    student_type: "show_both",
    default_status: "Active",
    send_portal_login: false,
    group_tag: "",
    online_payments_enabled: false,
    registration_fee_enabled: false,
    registration_fee_amount: 0.0,
    registration_fee_category: "",
    registration_fee_description: "Registration fee, sign-up fee, etc.",
    required_fields: [],
    optional_fields: [],
    success_message:
      "Thank you for signing up!\n\nWe will contact you as soon as possible.",
    confirmation_email_enabled: false,
    confirmation_email_subject: "Sign-Up Confirmation",
    confirmation_email_body:
      "Dear %FirstName%,\n\nThank you for your interest in tutoring. We will contact you within one business day.\n\nSincerely,\n%TutorFirstName%\n%BusinessName%",
    conversion_tracking_code: "",
  });

  const widgetTypes = [
    { id: "signup", label: "Sign-Up" },
    { id: "book_availability", label: "Book from Availability" },
    { id: "book_calendar", label: "Book from Calendar" },
    // { id: 'login', label: 'Login' },
    // { id: 'contact', label: 'Contact' },
  ];

  const studentStatuses = ["Active", "Trial", "Waiting", "Lead"];

  const defaultFields = [
    "Address",
    "Birthday",
    "Email",
    "Phone",
    "FaceTime ID",
    "Gender",
    "How Did You Hear About Us? (Referrer)",
    "School",
    "Skill Level",
    "Skype ID",
    "Zoom ID",
    "Subjects",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleWidgetTypeChange = (type) => {
    setActiveTab(type);
    setFormData({
      ...formData,
      widget_type: type,
    });
  };

  const handleOpenModal = (widgetId = null) => {
    if (widgetId) {
      loadWidgetData(widgetId);
    } else {
      // Reset to create mode
      setIsEditMode(false);
      setCurrentWidgetId(null);
      setShowModal(true);
      setCurrentStep(1);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setShowRequiredDropdown(false);
    setShowOptionalDropdown(false);
    setIsEditMode(false);
    setCurrentWidgetId(null);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        requiredDropdownRef.current &&
        !requiredDropdownRef.current.contains(event.target)
      ) {
        setShowRequiredDropdown(false);
      }
      if (
        optionalDropdownRef.current &&
        !optionalDropdownRef.current.contains(event.target)
      ) {
        setShowOptionalDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load widget data for editing
  const loadWidgetData = async (widgetId) => {
    try {
      setLoading(true);
      const response = await widgetAPI.getWidget(widgetId);
      const widget = response.data;

      // Use the same defaultFields array for consistency
      const requiredFields = [];
      const optionalFields = [];
      const customFieldsList = [];

      widget.custom_fields?.forEach((field) => {
        // Check if it's a default field (must be in defaultFields list)
        const isDefaultField = defaultFields.includes(field.field_name);

        if (isDefaultField) {
          // It's a default field - add to Required or Optional based on is_required
          if (field.is_required === "1") {
            requiredFields.push(field.field_name);
          } else {
            optionalFields.push(field.field_name);
          }
        } else {
          // It's a custom field - NOT in the default fields list
          customFieldsList.push({
            id: field.id,
            field_name: field.field_name,
            field_type: field.field_type,
            field_options: field.field_options || [],
            hint_text: field.hint_text || "",
            is_required: field.is_required === "1",
            collection_type: field.collection_type,
            field_order: field.field_order,
          });
        }
      });

      setFormData({
        widget_type: widget.widget_type,
        widget_title: widget.widget_title,
        accent_color: widget.accent_color,
        student_type: widget.student_type,
        default_status: widget.default_status,
        send_portal_login: widget.send_portal_login === "1",
        group_tag: widget.group_tag || "",
        online_payments_enabled: widget.enable_online_payment === "1",
        registration_fee_enabled: widget.enable_registration_fee === "1",
        registration_fee_amount:
          parseFloat(widget.registration_fee_amount) || 0,
        registration_fee_category: widget.registration_fee_category || "",
        registration_fee_description: widget.registration_fee_description || "",
        required_fields: requiredFields,
        optional_fields: optionalFields,
        success_message: widget.success_message,
        confirmation_email_enabled: widget.confirmation_email_enabled === "1",
        confirmation_email_subject: widget.confirmation_email_subject || "",
        confirmation_email_body: widget.confirmation_email_body || "",
        conversion_tracking_code: widget.conversion_tracking_code || "",
      });

      setCustomFields(customFieldsList);
      setActiveTab(widget.widget_type);
      setIsEditMode(true);
      setCurrentWidgetId(widgetId);
      setShowModal(true);
      setCurrentStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load widget data");
    } finally {
      setLoading(false);
    }
  };

  // Effect to load widget if editWidgetId is provided
  useEffect(() => {
    if (editWidgetId) {
      loadWidgetData(editWidgetId);
    }
  }, [editWidgetId]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only submit when on step 3
    if (currentStep !== 3) {
      handleNextStep();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare custom fields - combine default fields and custom fields
      const allCustomFields = [];

      // Add required default fields
      formData.required_fields.forEach((fieldName) => {
        allCustomFields.push({
          field_name: fieldName,
          field_type: "text_single",
          hint_text: "",
          is_required: 1,
          collection_type: "once_per_form",
        });
      });

      // Add optional default fields
      formData.optional_fields.forEach((fieldName) => {
        allCustomFields.push({
          field_name: fieldName,
          field_type: "text_single",
          hint_text: "",
          is_required: 0,
          collection_type: "once_per_form",
        });
      });

      // Add custom fields (only valid ones with name and type)
      customFields.forEach((field) => {
        // Skip invalid fields without name or type
        if (!field.field_name || !field.field_type) {
          return;
        }

        const customField = {
          field_name: field.field_name,
          field_type: field.field_type,
          hint_text: field.hint_text || "",
          is_required: field.is_required ? 1 : 0,
          collection_type: field.collection_type || "once_per_form",
        };

        // Only add field_options if the field type requires it (radio, checkbox, dropdown)
        if (
          ["radio", "checkbox", "dropdown"].includes(field.field_type) &&
          field.field_options &&
          field.field_options.length > 0
        ) {
          customField.field_options = field.field_options;
        }

        allCustomFields.push(customField);
      });

      const payload = {
        widget_title: formData.widget_title,
        accent_color: formData.accent_color,
        student_type: formData.student_type,
        default_status: formData.default_status,
        send_portal_login: formData.send_portal_login ? 1 : 0,
        group_tag: formData.group_tag,
        enable_online_payment: formData.online_payments_enabled ? 1 : 0,
        enable_registration_fee: formData.registration_fee_enabled ? 1 : 0,
        registration_fee_amount: formData.registration_fee_amount,
        registration_fee_category: formData.registration_fee_category,
        registration_fee_description: formData.registration_fee_description,
        success_message: formData.success_message,
        confirmation_email_enabled: formData.confirmation_email_enabled ? 1 : 0,
        confirmation_email_subject: formData.confirmation_email_subject,
        confirmation_email_body: formData.confirmation_email_body,
        custom_fields: allCustomFields,
        is_active: 1,
      };

      let response;
      if (isEditMode && currentWidgetId) {
        // Update existing widget
        payload.widget_id = currentWidgetId;
        response = await widgetAPI.updateWidget(currentWidgetId, payload);
        setSuccess({
          message: "Widget updated successfully!",
          embed_code: response.data.embed_code || "",
          widget_id: currentWidgetId,
        });
      } else {
        // Create new widget
        payload.widget_type = formData.widget_type;
        response = await widgetAPI.createWidget(payload);
        setSuccess({
          message: "Widget created successfully!",
          embed_code: response.data.embed_code,
          widget_id: response.data.widget_id,
        });
      }

      if (onWidgetCreated) {
        onWidgetCreated();
      }

      handleCloseModal();

      // Reset form
      setFormData({
        widget_type: "signup",
        widget_title: "Sign-Up",
        accent_color: "#587087",
        student_type: "show_both",
        default_status: "Active",
        send_portal_login: false,
        group_tag: "",
        online_payments_enabled: false,
        registration_fee_enabled: false,
        registration_fee_amount: 0.0,
        registration_fee_category: "",
        registration_fee_description: "Registration fee, sign-up fee, etc.",
        required_fields: [],
        optional_fields: [],
        success_message:
          "Thank you for signing up!\n\nWe will contact you as soon as possible.",
        confirmation_email_enabled: false,
        confirmation_email_subject: "Sign-Up Confirmation",
        confirmation_email_body:
          "Dear %FirstName%,\n\nThank you for your interest in tutoring. We will contact you within one business day.\n\nSincerely,\n%TutorFirstName%\n%BusinessName%",
        conversion_tracking_code: "",
      });
      setCustomFields([]);
      setIsEditMode(false);
      setCurrentWidgetId(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} widget`
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "General Settings";
      case 2:
        return "Extra Fields";
      case 3:
        return "Confirmation";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Website Settings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Website & Widgets</h2>
          <button className="text-gray-600 hover:text-gray-900">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Website Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Website Details
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                What's your website URL?
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              type="button"
              className="text-red-500 font-medium text-sm hover:text-red-600"
            >
              Build a Website with Seemii
            </button>
          </div>

          {/* Widgets Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Widgets
            </h3>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-8 -mb-px">
                {widgetTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleWidgetTypeChange(type.id)}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                      activeTab === type.id
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                {activeTab === "signup" &&
                  "Embed a customizable sign-up form on your website to register new students. The student details will automatically be added to your TutorBird account for a seamless experience."}
                {activeTab === "book_availability" &&
                  "Embed a customizable sign-up form with a booking feature. New students can book their first lesson as they sign up."}
                {activeTab === "book_calendar" &&
                  "Allow students to book sessions directly from a calendar view."}
                {activeTab === "login" &&
                  "Add a login widget for student portal access."}
                {activeTab === "contact" &&
                  "Add a contact form to your website."}
              </p>
            </div>

            {/* New Widget Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition">
              <button
                onClick={() => handleOpenModal(null)}
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Widget
              </button>
            </div>

            {/* Accent Color */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accent_color"
                  value={formData.accent_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-700">
                  {formData.accent_color.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">
                {success.message}
              </p>
              {success.embed_code && (
                <div className="mt-3">
                  <p className="text-sm text-green-700 mb-2 font-semibold">
                    Embed Code:
                  </p>
                  <div className="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                    {success.embed_code}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-3 text-green-500 hover:text-green-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit" : "New"}{" "}
                {widgetTypes.find((w) => w.id === activeTab)?.label} Widget
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Step 1: General Settings */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Widget Title
                      </label>
                      <input
                        type="text"
                        name="widget_title"
                        value={formData.widget_title}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Student Defaults
                      </h3>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Student Type
                        </label>
                        {["Adult only", "Child only", "Show both options"].map(
                          (option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="student_type"
                                value={
                                  option === "Adult only"
                                    ? "adult_only"
                                    : option === "Child only"
                                    ? "child_only"
                                    : "show_both"
                                }
                                checked={
                                  formData.student_type ===
                                  (option === "Adult only"
                                    ? "adult_only"
                                    : option === "Child only"
                                    ? "child_only"
                                    : "show_both")
                                }
                                onChange={handleChange}
                                className="w-4 h-4 text-teal-600"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Default Status
                      </label>
                      <div className="space-y-2">
                        {studentStatuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="default_status"
                              value={status}
                              checked={formData.default_status === status}
                              onChange={handleChange}
                              className="w-4 h-4 text-teal-600"
                            />
                            <span className="text-sm text-gray-700">
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="send_portal_login"
                        checked={formData.send_portal_login}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-teal-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700">
                          Send portal login information to the student/parent
                          once they are signed up
                        </span>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Tag
                      </label>
                      <input
                        type="text"
                        name="group_tag"
                        value={formData.group_tag}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional</p>
                    </div>

                    {/* Online Payments */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Online Payments
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Collect payment information on the Sign-Up form.
                            Requires Stripe or PayPal.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="online_payments_enabled"
                            checked={formData.online_payments_enabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Registration Fee */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Registration Fee
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Add a one-time fee to the student's family account.
                            This fee can be paid at a later date, unless you
                            have selected the option to collect it through
                            online payment.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="registration_fee_enabled"
                            checked={formData.registration_fee_enabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>

                      {formData.registration_fee_enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount
                            </label>
                            <input
                              type="number"
                              name="registration_fee_amount"
                              value={formData.registration_fee_amount}
                              onChange={handleChange}
                              step="0.01"
                              min="0"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="$ 0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Charge Category
                            </label>
                            <select
                              name="registration_fee_category"
                              value={formData.registration_fee_category}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="">Not specified</option>
                              <option value="registration">Registration</option>
                              <option value="materials">Materials</option>
                              <option value="other">Other</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Optional
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Transaction Description
                            </label>
                            <input
                              type="text"
                              name="registration_fee_description"
                              value={formData.registration_fee_description}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Registration fee, sign-up fee, etc."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Additional Fields */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Additional Fields
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Your sign-up form will include default fields such as
                        first name, last name, phone number, and email address.
                        You can add additional fields to the form and decide
                        whether they should be{" "}
                        <span className="font-semibold">required</span> or{" "}
                        <span className="font-semibold">optional</span> using
                        the options below.
                      </p>
                    </div>

                    <div ref={requiredDropdownRef} className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Required Fields
                      </label>
                      <div
                        onClick={() =>
                          setShowRequiredDropdown(!showRequiredDropdown)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer hover:border-teal-500 focus:ring-2 focus:ring-teal-500 min-h-[48px] flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-500">
                          {formData.required_fields.length > 0
                            ? `${formData.required_fields.length} field(s) selected`
                            : "Select fields..."}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            showRequiredDropdown ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {showRequiredDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {defaultFields
                            .filter(
                              (field) =>
                                !formData.optional_fields.includes(field)
                            )
                            .map((field) => (
                              <div
                                key={field}
                                onClick={() => {
                                  const isSelected =
                                    formData.required_fields.includes(field);
                                  setFormData({
                                    ...formData,
                                    required_fields: isSelected
                                      ? formData.required_fields.filter(
                                          (f) => f !== field
                                        )
                                      : [...formData.required_fields, field],
                                    optional_fields:
                                      formData.optional_fields.filter(
                                        (f) => f !== field
                                      ),
                                  });
                                }}
                                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm ${
                                  formData.required_fields.includes(field)
                                    ? "bg-teal-50 text-teal-900 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{field}</span>
                                  {formData.required_fields.includes(field) && (
                                    <svg
                                      className="w-4 h-4 text-teal-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Display Selected Required Fields */}
                      {formData.required_fields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.required_fields.map((field, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-sm font-medium"
                            >
                              {field}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    required_fields:
                                      formData.required_fields.filter(
                                        (_, i) => i !== index
                                      ),
                                  });
                                }}
                                className="text-teal-600 hover:text-teal-900 hover:bg-teal-200 rounded-full p-0.5"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div ref={optionalDropdownRef} className="relative">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Optional Fields
                      </label>
                      <div
                        onClick={() =>
                          setShowOptionalDropdown(!showOptionalDropdown)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer hover:border-teal-500 focus:ring-2 focus:ring-teal-500 min-h-[48px] flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-500">
                          {formData.optional_fields.length > 0
                            ? `${formData.optional_fields.length} field(s) selected`
                            : "Select fields..."}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            showOptionalDropdown ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {showOptionalDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {defaultFields
                            .filter(
                              (field) =>
                                !formData.required_fields.includes(field)
                            )
                            .map((field) => (
                              <div
                                key={field}
                                onClick={() => {
                                  const isSelected =
                                    formData.optional_fields.includes(field);
                                  setFormData({
                                    ...formData,
                                    optional_fields: isSelected
                                      ? formData.optional_fields.filter(
                                          (f) => f !== field
                                        )
                                      : [...formData.optional_fields, field],
                                    required_fields:
                                      formData.required_fields.filter(
                                        (f) => f !== field
                                      ),
                                  });
                                }}
                                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm ${
                                  formData.optional_fields.includes(field)
                                    ? "bg-blue-50 text-blue-900 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{field}</span>
                                  {formData.optional_fields.includes(field) && (
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Display Selected Optional Fields */}
                      {formData.optional_fields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.optional_fields.map((field, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                            >
                              {field}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    optional_fields:
                                      formData.optional_fields.filter(
                                        (_, i) => i !== index
                                      ),
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Custom Fields
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Drag the fields to reorder them
                      </p>
                      <CustomFieldBuilder
                        customFields={customFields}
                        setCustomFields={setCustomFields}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Registration Success Message
                      </label>
                      <div className="border border-gray-300 rounded-lg p-2 bg-white">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <span className="font-bold">B</span>
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <span className="italic">I</span>
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <span className="underline">U</span>
                          </button>
                        </div>
                        <textarea
                          name="success_message"
                          value={formData.success_message}
                          onChange={handleChange}
                          rows="6"
                          className="w-full px-2 py-2 border-0 focus:ring-0 focus:outline-none resize-none"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Customize the message students see on their screen once
                        they successfully complete the registration process.
                      </p>
                    </div>

                    {/* Confirmation Email */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Confirmation Email
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Email students a confirmation after they submit
                            their registration.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="confirmation_email_enabled"
                            checked={formData.confirmation_email_enabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>

                      {formData.confirmation_email_enabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subject
                            </label>
                            <input
                              type="text"
                              name="confirmation_email_subject"
                              value={formData.confirmation_email_subject}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Message
                            </label>
                            <div className="border border-gray-300 rounded-lg p-2 bg-white">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <span className="font-bold">B</span>
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <span className="italic">I</span>
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <span className="underline">U</span>
                                </button>
                              </div>
                              <textarea
                                name="confirmation_email_body"
                                value={formData.confirmation_email_body}
                                onChange={handleChange}
                                rows="8"
                                className="w-full px-2 py-2 border-0 focus:ring-0 focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Conversion Tracking */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Conversion Tracking Code
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Embed a tracking code, such as Google Analytics, to
                            monitor student registrations through this widget.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={
                    currentStep === 1 ? handleCloseModal : handlePrevStep
                  }
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    Step {currentStep} of 3
                  </div>
                  <div className="text-xs text-gray-500">{getStepTitle()}</div>
                </div>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextStep();
                    }}
                    className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                      ? "Update Widget"
                      : "Save Widget"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetBuilder;
