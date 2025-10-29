import React from 'react';
import SignupWidget from './SignupWidget';
import LoginWidget from './LoginWidget';
import ContactWidget from './ContactWidget';
import BookingWidget from './BookingWidget';
import CalendarBookingWidget from './CalendarBookingWidget';
import ErrorWidget from './ErrorWidget';

/**
 * WidgetRenderer - Dynamically renders the appropriate widget based on type
 * 
 * Props:
 * - widgetType: string - Type of widget to render (signup, login, contact, book_availability, book_calendar)
 * - widget: object - Widget configuration data
 * - availableSlots: object - Available booking slots (for booking widgets)
 * - apiBaseUrl: string - Base URL for API calls
 */
const WidgetRenderer = ({ 
  widgetType, 
  widget, 
  availableSlots = {}, 
  apiBaseUrl = 'http://localhost/mtpsaas/public' 
}) => {
  // If no widget or invalid type, show error
  if (!widget || !widgetType) {
    return <ErrorWidget message="Widget configuration is missing" />;
  }

  // Render appropriate widget based on type
  switch (widgetType.toLowerCase()) {
    case 'signup':
    case 'sign-up':
      return <SignupWidget widget={widget} apiBaseUrl={apiBaseUrl} />;

    case 'login':
      return <LoginWidget widget={widget} apiBaseUrl={apiBaseUrl} />;

    case 'contact':
      return <ContactWidget widget={widget} apiBaseUrl={apiBaseUrl} />;

    case 'book_availability':
    case 'book-availability':
      return <BookingWidget widget={widget} availableSlots={availableSlots} apiBaseUrl={apiBaseUrl} />;

    case 'book_calendar':
    case 'book-calendar':
      return <CalendarBookingWidget widget={widget} apiBaseUrl={apiBaseUrl} />;

    default:
      return <ErrorWidget message={`Unknown widget type: ${widgetType}`} />;
  }
};

export default WidgetRenderer;
